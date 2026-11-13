interface Act {
  start: number;
  end: number;
  hook: number;
  hookWide: number;
  enter: number;
  rest: number;
  restNarrow: number;
  ballRest: number;
  dir: 1 | -1;
  swing: boolean;
}

interface Frame {
  cx: number;
  lift: number;
  pose: string;
  bx: number;
  by: number;
}

interface Actor {
  id: string;
  act: Act;
  cat: HTMLElement;
  ball: HTMLElement;
  hook: HTMLElement;
  glow: SVGPathElement;
  line: SVGPathElement;
  poses: HTMLElement[];
  pose: string;
  catTransform: string;
  ballTransform: string;
  thread: string;
}

const ACTS: Record<string, Act> = {
  pivi: { start: 0.03, end: 0.31, hook: 0.2, hookWide: 0.4, enter: -0.3, rest: 0.8, restNarrow: 0.82, ballRest: 0.94, dir: 1, swing: false },
  mandarino: { start: 0.31, end: 0.59, hook: 0.66, hookWide: 0.66, enter: 1.3, rest: 0.2, restNarrow: 0.18, ballRest: 0.06, dir: -1, swing: false },
  zombie: { start: 0.59, end: 0.88, hook: 0.5, hookWide: 0.5, enter: -0.3, rest: 0.5, restNarrow: 0.5, ballRest: 0.64, dir: 1, swing: true },
};
const END = 0.9;

const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const ease = (t: number): number => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const smooth = (a: number, b: number, value: number): number => ease(clamp((value - a) / (b - a)));

const section = document.querySelector<HTMLElement>('[data-interlude]');

if (section) {
  const stage = section.querySelector<HTMLElement>('.il-stage')!;
  const threads = section.querySelector<SVGSVGElement>('.il-threads')!;
  const flat = window.matchMedia('(prefers-reduced-motion: reduce), (max-height: 479px)');

  const actors: Actor[] = Object.keys(ACTS).map((id) => {
    const cat = section.querySelector<HTMLElement>(`.il-cat[data-actor="${id}"]`)!;
    const group = threads.querySelector<SVGGElement>(`[data-thread="${id}"]`)!;
    return {
      id,
      act: ACTS[id],
      cat,
      ball: section.querySelector<HTMLElement>(`.il-ball[data-ball="${id}"]`)!,
      hook: section.querySelector<HTMLElement>(`.il-hook[data-hook="${id}"]`)!,
      glow: group.querySelector<SVGPathElement>('.il-thread-glow')!,
      line: group.querySelector<SVGPathElement>('.il-thread-line')!,
      poses: [...cat.querySelectorAll<HTMLElement>('.il-pose')],
      pose: 'sleep',
      catTransform: '',
      ballTransform: '',
      thread: '',
    };
  });

  let width = 0;
  let height = 0;
  let size = 0;
  let ballSize = 0;
  const restX = (act: Act): number => (width < 640 ? act.restNarrow : act.rest) * width;
  const hookX = (act: Act): number => (width >= 1024 ? act.hookWide : act.hook) * width;

  new IntersectionObserver(
    (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      section.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((image) => (image.loading = 'eager'));
      observer.disconnect();
    },
    { rootMargin: '120% 0px' },
  ).observe(section);

  const setPose = (actor: Actor, pose: string): void => {
    if (actor.pose === pose) return;
    actor.pose = pose;
    actor.poses.forEach((image) => image.toggleAttribute('data-active', image.dataset.pose === pose));
    actor.cat.toggleAttribute('data-asleep', pose === 'sleep');
  };

  const idle = (actor: Actor, length: number): Pick<Frame, 'bx' | 'by'> => ({ bx: hookX(actor.act), by: length });

  const chase = (actor: Actor, q: number): Frame => {
    const { act } = actor;
    const hang = height * 0.3;
    const floor = height - ballSize / 2;
    if (q <= 0) return { cx: act.enter * width, lift: 0, pose: 'walk', ...idle(actor, hang) };
    const drop = clamp(q / 0.19);
    const roll = clamp((q - 0.25) / 0.55);
    const bx = lerp(hookX(act), act.ballRest * width, ease(roll));
    const by = lerp(hang, floor, drop * drop) - Math.abs(Math.sin(roll * Math.PI * 5)) * height * 0.1;
    const gap = lerp(size * 0.58, Math.abs(act.ballRest * width - restX(act)), smooth(0.7, 0.9, q));
    const cx = lerp(act.enter * width, bx - act.dir * gap, smooth(0, 0.08, q));
    let pose = 'sleep';
    let lift = 0;
    if (q < 0.08) {
      pose = 'walk';
      lift = Math.abs(Math.sin(q * 110)) * size * 0.03;
    } else if (q < 0.2) pose = 'look-up';
    else if (q < 0.3) pose = 'crouch';
    else if (q < 0.8) {
      const phase = (q * 10) % 1;
      pose = phase < 0.5 ? 'pounce' : 'walk';
      lift = phase < 0.5 ? Math.sin(phase * 2 * Math.PI) * height * 0.07 : Math.abs(Math.sin(phase * 4 * Math.PI)) * size * 0.03;
    } else if (q < 0.92) pose = 'swipe';
    return { cx, lift, pose, bx, by };
  };

  const swing = (actor: Actor, q: number): Frame => {
    const { act } = actor;
    const hang = height * 0.3;
    const floor = height - ballSize / 2;
    if (q <= 0) return { cx: act.enter * width, lift: 0, pose: 'walk', ...idle(actor, hang) };
    const reach = Math.max(hang, height - size * 0.86 - ballSize * 0.9);
    const length = lerp(hang, reach, smooth(0.1, 0.36, q));
    const kick = 0.16 + 0.42 * smooth(0.4, 0.46, q) * (1 - smooth(0.6, 0.68, q));
    const amplitude = Math.min(kick, Math.asin(Math.min(1, (width * 0.2) / length)));
    const angle = Math.sin(q * Math.PI * 9) * amplitude * (1 - smooth(0.66, 0.71, q));
    const fall = smooth(0.71, 0.84, q);
    const bx = lerp(hookX(act) + Math.sin(angle) * length, act.ballRest * width, fall);
    const by = lerp(Math.cos(angle) * length, floor, fall * fall) - Math.sin(fall * Math.PI) * height * 0.05;
    const cx = lerp(act.enter * width, restX(act), smooth(0, 0.3, q));
    let pose = 'sleep';
    let lift = 0;
    if (q < 0.3) {
      pose = 'walk';
      lift = Math.abs(Math.sin(q * 110)) * size * 0.03;
    } else if (q < 0.4) pose = 'look-up';
    else if (q < 0.48) pose = 'swipe';
    else if (q < 0.56) pose = 'look-up';
    else if (q < 0.64) pose = 'crouch';
    else if (q < 0.76) {
      pose = 'pounce';
      lift = Math.sin(((q - 0.64) / 0.12) * Math.PI) * size * 0.42;
    } else if (q < 0.9) pose = 'swipe';
    return { cx, lift, pose, bx, by };
  };

  const render = (progress: number): void => {
    let turn = '';
    for (const actor of actors) {
      const { act } = actor;
      const q = clamp((progress - act.start) / (act.end - act.start));
      const frame = act.swing ? swing(actor, q) : chase(actor, q);
      const running = q > 0 && q < 1;
      if (running) turn = actor.id;
      setPose(actor, frame.pose);
      actor.cat.toggleAttribute('data-running', running);
      const catTransform = `translate3d(${(frame.cx - size / 2).toFixed(1)}px, ${(height - size * 0.93 - frame.lift).toFixed(1)}px, 0)`;
      if (catTransform !== actor.catTransform) actor.cat.style.transform = actor.catTransform = catTransform;
      const spin = ((frame.bx / ballSize) * 57).toFixed(1);
      const ballTransform = `translate3d(${(frame.bx - ballSize / 2).toFixed(1)}px, ${(frame.by - ballSize / 2).toFixed(1)}px, 0) rotate(${spin}deg)`;
      if (ballTransform !== actor.ballTransform) actor.ball.style.transform = actor.ballTransform = ballTransform;
      const hx = hookX(act);
      const sag = Math.min(Math.abs(frame.bx - hx) * 0.32, height * 0.4);
      const thread = `M${hx.toFixed(1)} 0 Q${((hx + frame.bx) / 2).toFixed(1)} ${(frame.by / 2 + sag).toFixed(1)} ${frame.bx.toFixed(1)} ${frame.by.toFixed(1)}`;
      if (thread !== actor.thread) {
        actor.thread = thread;
        actor.glow.setAttribute('d', thread);
        actor.line.setAttribute('d', thread);
      }
    }
    if (turn) section.setAttribute('data-turn', turn);
    else section.removeAttribute('data-turn');
    section.toggleAttribute('data-end', progress > END);
  };

  const measure = (): void => {
    width = stage.clientWidth;
    height = stage.clientHeight;
    size = clamp(width * 0.36, 128, 260);
    ballSize = clamp(width * 0.075, 34, 68);
    threads.setAttribute('viewBox', `0 0 ${width} ${height}`);
    for (const actor of actors) {
      actor.cat.style.width = `${size}px`;
      actor.ball.style.width = actor.ball.style.height = `${ballSize}px`;
      actor.hook.style.transform = `translate3d(${hookX(actor.act).toFixed(1)}px, 0, 0)`;
      actor.cat.toggleAttribute('data-flip', actor.act.dir === -1);
      actor.catTransform = actor.ballTransform = actor.thread = '';
    }
  };

  let target = 0;
  let current = -1;
  let frame = 0;

  const tick = (): void => {
    frame = 0;
    const delta = target - current;
    current = current < 0 || Math.abs(delta) < 0.0004 ? target : current + delta * 0.16;
    render(current);
    if (current !== target) frame = requestAnimationFrame(tick);
  };

  const request = (): void => {
    if (flat.matches) return;
    const rect = section.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    target = clamp(total > 0 ? -rect.top / total : 0);
    if (!frame) frame = requestAnimationFrame(tick);
  };

  const apply = (): void => {
    if (flat.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      current = -1;
      section.removeAttribute('data-js');
      section.removeAttribute('data-turn');
      section.setAttribute('data-static', '');
      section.setAttribute('data-end', '');
      for (const actor of actors) {
        setPose(actor, 'sleep');
        actor.cat.setAttribute('data-asleep', '');
        actor.cat.removeAttribute('data-running');
        actor.cat.removeAttribute('data-flip');
        actor.cat.removeAttribute('style');
        actor.ball.removeAttribute('style');
        actor.hook.removeAttribute('style');
      }
      return;
    }
    section.removeAttribute('data-static');
    section.setAttribute('data-js', '');
    measure();
    request();
  };

  apply();
  flat.addEventListener('change', apply);
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', () => {
    if (flat.matches) return;
    measure();
    current = -1;
    request();
  });
}

export {};
