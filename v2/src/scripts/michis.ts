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

document.querySelectorAll<HTMLElement>('.michi[data-interact]:not([data-interact="none"])').forEach((michi) => {
  const poses = [...michi.querySelectorAll<HTMLElement>('.michi-pose')];
  const base = poses[0]?.dataset.pose ?? '';
  const wake = michi.dataset.interact === 'wake';
  const target = wake ? michi.dataset.wake ?? base : 'meow';
  if (!poses.some((image) => image.dataset.pose === target)) return;
  let timer = 0;
  const trigger = () => {
    window.clearTimeout(timer);
    setPose(michi, target);
    say(michi);
    timer = window.setTimeout(() => setPose(michi, base), wake ? 4200 : 1500);
  };
  michi.addEventListener('pointerenter', trigger);
  michi.addEventListener('click', trigger);
});

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
