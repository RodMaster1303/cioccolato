const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function setPose(michi: Element, pose: string): void {
  michi.querySelectorAll<HTMLElement>('.michi-pose').forEach((image) => {
    image.toggleAttribute('data-active', image.dataset.pose === pose);
  });
}

function say(michi: HTMLElement): void {
  michi.removeAttribute('data-talking');
  void michi.offsetWidth;
  michi.setAttribute('data-talking', '');
}

const triggers = new Map<HTMLElement, () => void>();

document.querySelectorAll<HTMLElement>('.michi[data-interact]:not([data-interact="none"])').forEach((michi) => {
  const poses = [...michi.querySelectorAll<HTMLElement>('.michi-pose')];
  const base = poses[0]?.dataset.pose ?? '';
  const wake = michi.dataset.interact === 'wake';
  const target = wake ? michi.dataset.wake ?? base : 'meow';
  if (!poses.some((image) => image.dataset.pose === target)) return;
  let timer = 0;
  const trigger = () => {
    window.clearTimeout(timer);
    michi.setAttribute('data-busy', '');
    setPose(michi, target);
    say(michi);
    timer = window.setTimeout(() => {
      michi.removeAttribute('data-busy');
      setPose(michi, base);
    }, wake ? 4200 : 1500);
  };
  michi.addEventListener('pointerenter', trigger);
  michi.addEventListener('click', trigger);
  if (!wake) triggers.set(michi, trigger);
});

if (!reduceMotion && 'IntersectionObserver' in window) {
  const live = new Set<HTMLElement>();
  const watcher = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) live.add(entry.target as HTMLElement);
        else live.delete(entry.target as HTMLElement);
      }
    },
    { threshold: 0.6 },
  );
  const routined = [...document.querySelectorAll<HTMLElement>('.michi[data-routine]')];
  new Set([...routined, ...triggers.keys()]).forEach((michi) => watcher.observe(michi));

  const image = (michi: HTMLElement, pose: string): HTMLImageElement | null =>
    michi.querySelector<HTMLImageElement>(`.michi-pose[data-pose="${pose}"]`);
  const flash = (michi: HTMLElement, pose: string, ms: number): void => {
    const target = image(michi, pose);
    if (!live.has(michi) || document.hidden || michi.hasAttribute('data-busy') || michi.hasAttribute('data-flash')) return;
    if (!target || !target.complete || !target.naturalWidth) return;
    const base = michi.querySelector<HTMLElement>('.michi-pose')?.dataset.pose ?? '';
    michi.setAttribute('data-flash', pose);
    setPose(michi, pose);
    window.setTimeout(() => {
      michi.removeAttribute('data-flash');
      if (!michi.hasAttribute('data-busy')) setPose(michi, base);
    }, ms);
  };
  const loop = (task: () => void, min: number, max: number): void => {
    const run = (): void => {
      task();
      window.setTimeout(run, min + Math.random() * (max - min));
    };
    window.setTimeout(run, min * 0.5 + Math.random() * (max - min));
  };
  routined.forEach((michi) => {
    if (image(michi, 'blink')) loop(() => flash(michi, 'blink', 140), 2400, 6000);
    if (image(michi, 'look-left') && image(michi, 'look-right')) {
      let left = Math.random() < 0.5;
      loop(
        () => {
          left = !left;
          flash(michi, left ? 'look-left' : 'look-right', 1000);
        },
        4200,
        8000,
      );
    }
    if (image(michi, 'pounce')) loop(() => flash(michi, 'pounce', 700), 2200, 3800);
  });
  loop(
    () => {
      const idle = [...triggers.keys()].filter((michi) => live.has(michi) && !michi.hasAttribute('data-busy') && !document.hidden);
      triggers.get(idle[Math.floor(Math.random() * idle.length)])?.();
    },
    5200,
    8800,
  );
}

if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  const layer = document.createElement('div');
  layer.className = 'paws';
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);
  let lastX = -999;
  let lastY = -999;
  let step = 0;
  window.addEventListener(
    'pointermove',
    (event) => {
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      if (Math.hypot(dx, dy) < 120) return;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      const side = step++ % 2 === 0 ? -9 : 9;
      const nx = -dy / Math.hypot(dx, dy);
      const ny = dx / Math.hypot(dx, dy);
      const paw = document.createElement('span');
      paw.className = 'paw';
      paw.style.left = `${event.clientX + nx * side}px`;
      paw.style.top = `${event.clientY + ny * side}px`;
      paw.style.setProperty('--r', `${angle}deg`);
      paw.addEventListener('animationend', () => paw.remove());
      layer.append(paw);
      while (layer.childElementCount > 14) layer.firstElementChild?.remove();
      lastX = event.clientX;
      lastY = event.clientY;
    },
    { passive: true },
  );
}
