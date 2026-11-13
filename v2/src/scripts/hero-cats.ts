type Look = 'sit' | 'look-left' | 'look-right' | 'look-up';

interface HeroCat {
  el: HTMLElement;
  images: Map<string, HTMLImageElement>;
  pose: string;
  gaze: Look;
  override: string | null;
  blinking: boolean;
  overrideTimer: number;
  blinkTimer: number;
  playTimers: number[];
}

const SPARK_COLORS = ['#f15591', '#f4c864', '#26e9eb', '#8feb58'];
const SLEEP_AFTER = 24000;
const WANDER_LOOKS: Look[] = ['look-left', 'look-right', 'look-up'];
const HUNT_POSES = ['crouch', 'pounce', 'swipe'] as const;

const root = document.querySelector<HTMLElement>('[data-hero-trio]');
const section = root?.closest('section');
if (root && section) start(root, section);

function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function start(trio: HTMLElement, hero: HTMLElement): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const html = document.documentElement;
  const cats: HeroCat[] = [...trio.querySelectorAll<HTMLElement>('.cat')].map((el) => ({
    el,
    images: new Map<string, HTMLImageElement>([...el.querySelectorAll<HTMLImageElement>('.cat-pose')].map((image): [string, HTMLImageElement] => [image.dataset.pose ?? '', image])),
    pose: 'sit',
    gaze: 'sit',
    override: null,
    blinking: false,
    overrideTimer: 0,
    blinkTimer: 0,
    playTimers: [],
  }));

  let visible = true;
  let sleeping = false;
  let lastMove = performance.now();
  let holdUntil = 0;
  let idleTimer = 0;
  let aimFrame = 0;
  let pointerX = 0;
  let pointerY = 0;

  const usable = (image: HTMLImageElement | undefined): image is HTMLImageElement =>
    image !== undefined && image.complete && image.naturalWidth > 0;

  function render(cat: HeroCat): void {
    const wanted = cat.override ?? (cat.blinking && cat.gaze === 'sit' ? 'blink' : cat.gaze);
    const target = usable(cat.images.get(wanted)) ? wanted : 'sit';
    if (cat.pose === target) return;
    cat.pose = target;
    cat.images.forEach((image, name) => image.toggleAttribute('data-active', name === target));
  }

  function burst(x: number, y: number, count = 8): void {
    const box = trio.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + random(-0.3, 0.3);
      const distance = random(26, 58);
      const spark = document.createElement('span');
      spark.className = 'hero-spark';
      spark.style.left = `${x - box.left}px`;
      spark.style.top = `${y - box.top}px`;
      spark.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      spark.style.setProperty('--c', SPARK_COLORS[i % SPARK_COLORS.length]);
      spark.addEventListener('animationend', () => spark.remove());
      trio.append(spark);
    }
  }

  function restart(element: HTMLElement, attribute: string): void {
    element.removeAttribute(attribute);
    void element.offsetWidth;
    element.setAttribute(attribute, '');
  }

  function gazeFor(cat: HeroCat, x: number, y: number): Look {
    const rect = cat.el.getBoundingClientRect();
    const dx = x - (rect.left + rect.width / 2);
    const up = rect.top + rect.height * 0.3 - y;
    if (up > rect.width * 0.9 && Math.abs(dx) < up * 1.1) return 'look-up';
    if (Math.abs(dx) < rect.width * 0.35) return 'sit';
    return dx < 0 ? 'look-left' : 'look-right';
  }

  function aim(x: number, y: number): void {
    cats.forEach((cat) => {
      cat.gaze = gazeFor(cat, x, y);
      render(cat);
    });
  }

  function lookAt(x: number, y: number, ms: number, except?: HeroCat): void {
    holdUntil = performance.now() + ms;
    cats.forEach((cat) => {
      if (cat === except) return;
      cat.gaze = gazeFor(cat, x, y);
      render(cat);
    });
    window.setTimeout(() => {
      if (performance.now() < holdUntil) return;
      cats.forEach((cat) => {
        cat.gaze = 'sit';
        render(cat);
      });
    }, ms + 60);
  }

  function buzz(): void {
    if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(12);
  }

  function meow(cat: HeroCat, others = true): void {
    if (sleeping) return;
    clearPlay(cat);
    window.clearTimeout(cat.overrideTimer);
    cat.override = usable(cat.images.get('meow')) ? 'meow' : null;
    render(cat);
    restart(cat.el, 'data-talking');
    restart(cat.el, 'data-hop');
    const rect = cat.el.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height * 0.28, 7);
    if (others) lookAt(rect.left + rect.width / 2, rect.top + rect.height * 0.3, 1300, cat);
    cat.overrideTimer = window.setTimeout(() => {
      cat.override = null;
      render(cat);
    }, 1250);
  }

  function canHunt(cat: HeroCat): boolean {
    return !sleeping && HUNT_POSES.every((name) => usable(cat.images.get(name)));
  }

  function nearestCat(x: number, y: number): HeroCat {
    let best = cats[0];
    let bestDistance = Infinity;
    cats.forEach((cat) => {
      const rect = cat.el.getBoundingClientRect();
      const distance = Math.hypot(x - (rect.left + rect.width / 2), y - (rect.top + rect.height * 0.6));
      if (distance < bestDistance) {
        best = cat;
        bestDistance = distance;
      }
    });
    return best;
  }

  function clearPlay(cat: HeroCat): void {
    cat.playTimers.forEach((id) => window.clearTimeout(id));
    cat.playTimers = [];
    cat.el.closest<HTMLElement>('.hero-cat-pos')?.removeAttribute('data-lunge');
  }

  function hunt(cat: HeroCat, x: number, y: number, onStrike: () => void): void {
    clearPlay(cat);
    window.clearTimeout(cat.overrideTimer);
    const rect = cat.el.getBoundingClientRect();
    const dx = x - (rect.left + rect.width / 2);
    const dy = y - (rect.top + rect.height * 0.6);
    HUNT_POSES.forEach((name) => cat.images.get(name)?.toggleAttribute('data-flip', dx < 0));
    const slot = cat.el.closest<HTMLElement>('.hero-cat-pos');
    if (slot) {
      slot.style.setProperty('--lx', `${Math.max(-rect.width * 0.55, Math.min(rect.width * 0.55, dx * 0.4))}px`);
      slot.style.setProperty('--ly', `${Math.max(-rect.height * 0.3, Math.min(rect.height * 0.12, dy * 0.25))}px`);
      restart(slot, 'data-lunge');
    }
    const step = (ms: number, pose: string | null, task?: () => void) =>
      cat.playTimers.push(
        window.setTimeout(() => {
          cat.override = pose;
          render(cat);
          task?.();
        }, ms),
      );
    cat.override = 'crouch';
    render(cat);
    step(260, 'pounce');
    step(540, 'swipe', onStrike);
    step(1050, null, () => clearPlay(cat));
  }

  function scheduleBlink(cat: HeroCat): void {
    window.clearTimeout(cat.blinkTimer);
    cat.blinkTimer = window.setTimeout(() => {
      if (visible && !document.hidden && !sleeping && !cat.override && cat.gaze === 'sit') {
        cat.blinking = true;
        render(cat);
        window.setTimeout(() => {
          cat.blinking = false;
          render(cat);
          if (Math.random() < 0.18) {
            window.setTimeout(() => {
              cat.blinking = true;
              render(cat);
              window.setTimeout(() => {
                cat.blinking = false;
                render(cat);
              }, 120);
            }, 170);
          }
        }, 130);
      }
      scheduleBlink(cat);
    }, random(2300, 5600));
  }

  let wanderQueue: { cat: HeroCat; look: Look }[] = [];

  function wander(): void {
    window.setTimeout(wander, random(3000, 6500));
    if (!visible || document.hidden || sleeping) return;
    if (performance.now() - lastMove < 3500 || performance.now() < holdUntil) return;
    if (!wanderQueue.length) {
      wanderQueue = cats.flatMap((cat) => WANDER_LOOKS.map((look) => ({ cat, look }))).sort(() => Math.random() - 0.5);
    }
    const next = wanderQueue[wanderQueue.length - 1];
    const cat = next.cat;
    if (cat.override) return;
    if (Math.random() < 0.2) {
      meow(cat);
      return;
    }
    wanderQueue.pop();
    cat.gaze = next.look;
    render(cat);
    window.setTimeout(() => {
      cat.gaze = 'sit';
      render(cat);
    }, random(900, 1500));
  }

  function fallAsleep(): void {
    if (!visible || document.hidden) return;
    sleeping = true;
    cats.forEach((cat, index) => {
      window.setTimeout(() => {
        if (!sleeping || !usable(cat.images.get('sleep'))) return;
        clearPlay(cat);
        cat.override = 'sleep';
        cat.el.setAttribute('data-sleeping', '');
        render(cat);
      }, index * 650);
    });
  }

  function wake(): void {
    if (!sleeping) return;
    sleeping = false;
    cats.forEach((cat, index) => {
      window.setTimeout(() => {
        cat.override = null;
        cat.el.removeAttribute('data-sleeping');
        render(cat);
        restart(cat.el, 'data-hop');
      }, index * 140);
    });
  }

  function activity(): void {
    lastMove = performance.now();
    wake();
    window.clearTimeout(idleTimer);
    if (visible) idleTimer = window.setTimeout(fallAsleep, SLEEP_AFTER);
  }

  function greet(): void {
    const pivi = cats[0];
    if (pivi) window.setTimeout(() => meow(pivi), 150);
  }

  function arm(tokens: string): void {
    cats.forEach((cat) => cat.el.setAttribute('data-armed', `${cat.el.getAttribute('data-armed') ?? ''} ${tokens}`.trim()));
  }

  let parallaxFrame = 0;
  hero.addEventListener(
    'pointermove',
    (event) => {
      if (parallaxFrame) return;
      const { clientX, clientY } = event;
      parallaxFrame = requestAnimationFrame(() => {
        parallaxFrame = 0;
        const rect = hero.getBoundingClientRect();
        trio.style.setProperty('--mx', String(((clientX - rect.left) / rect.width - 0.5) * 2));
        trio.style.setProperty('--my', String(((clientY - rect.top) / rect.height - 0.5) * 2));
      });
    },
    { passive: true },
  );
  hero.addEventListener('pointerleave', () => {
    trio.style.setProperty('--mx', '0');
    trio.style.setProperty('--my', '0');
  });

  if (reduce) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (!finePointer) {
    let driftFrame = 0;
    window.addEventListener(
      'scroll',
      () => {
        if (driftFrame || !visible) return;
        driftFrame = requestAnimationFrame(() => {
          driftFrame = 0;
          trio.style.setProperty('--my', (Math.min(window.scrollY / hero.offsetHeight, 1) * -2.4).toFixed(3));
        });
      },
      { passive: true },
    );
  }

  const idle = (callback: () => void, timeout: number): void => {
    const request = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
    if (request) request.call(window, callback, { timeout });
    else window.setTimeout(callback, 400);
  };
  const armBasic = () => idle(() => arm('basic'), 2500);
  if (document.readyState === 'complete') armBasic();
  else window.addEventListener('load', armBasic, { once: true });
  window.setTimeout(() => arm('late'), 3000);

  if (finePointer) {
    window.addEventListener(
      'pointermove',
      (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        activity();
        if (aimFrame || performance.now() < holdUntil) return;
        aimFrame = requestAnimationFrame(() => {
          aimFrame = 0;
          aim(pointerX, pointerY);
        });
      },
      { passive: true },
    );
  }
  (['pointerdown', 'keydown', 'wheel', 'touchstart'] as const).forEach((type) => window.addEventListener(type, activity, { passive: true }));
  window.addEventListener('scroll', activity, { passive: true });

  cats.forEach((cat) => {
    cat.el.addEventListener('pointerdown', () => {
      buzz();
      meow(cat);
    });
    cat.el.addEventListener('animationend', (event) => {
      if (event.animationName === 'hero-hop') cat.el.removeAttribute('data-hop');
    });
  });

  trio.querySelectorAll<HTMLElement>('[data-sweet]').forEach((sweet) => {
    sweet.addEventListener('pointerdown', () => {
      if (sleeping) return;
      const rect = sweet.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const pop = () => {
        restart(sweet, 'data-pop');
        burst(x, y, 9);
      };
      const hunter = nearestCat(x, y);
      if (canHunt(hunter)) {
        hunt(hunter, x, y, pop);
        lookAt(x, y, 1300, hunter);
      } else {
        pop();
        lookAt(x, y, 1500);
      }
    });
    sweet.addEventListener('animationend', (event) => {
      if (event.animationName === 'hero-sweet-pop') sweet.removeAttribute('data-pop');
    });
  });

  new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      window.clearTimeout(idleTimer);
      if (visible) idleTimer = window.setTimeout(fallAsleep, SLEEP_AFTER);
    },
    { threshold: 0.2 },
  ).observe(trio);

  const live = (landed: boolean): void => {
    cats.forEach((cat, index) => {
      scheduleBlink(cat);
      if (landed) window.setTimeout(() => restart(cat.el, 'data-hop'), index * 70);
    });
    if (landed) {
      trio.querySelectorAll<HTMLElement>('[data-sweet]').forEach((sweet, index) => {
        window.setTimeout(() => restart(sweet, 'data-pop'), 140 + index * 60);
      });
    }
    idleTimer = window.setTimeout(fallAsleep, SLEEP_AFTER);
    window.setTimeout(wander, random(3000, 5000));
    window.setTimeout(greet, landed ? 650 : 1500);
  };

  if (html.classList.contains('intro-active') || html.classList.contains('intro-closing')) {
    window.addEventListener('intro:done', () => live(true), { once: true });
  } else {
    live(false);
  }
}
