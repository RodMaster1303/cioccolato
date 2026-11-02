const header = document.getElementById('site-header');
const progress = document.getElementById('scroll-progress');

let ticking = false;

function updateScrollState(): void {
  ticking = false;
  const y = window.scrollY;
  header?.toggleAttribute('data-scrolled', y > 16);
  if (progress) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty('--progress', String(max > 0 ? Math.min(y / max, 1) : 0));
  }
}

function requestScrollUpdate(): void {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updateScrollState);
}

window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate, { passive: true });
updateScrollState();

const revealTargets = document.querySelectorAll<HTMLElement>('[data-reveal]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  revealTargets.forEach((element) => observer.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add('is-visible'));
}

const mobileMenu = document.getElementById('mobile-menu');
if (mobileMenu instanceof HTMLDialogElement) {
  document.querySelectorAll('[data-menu-open]').forEach((button) => {
    button.addEventListener('click', () => mobileMenu.showModal());
  });
  mobileMenu.querySelectorAll('[data-menu-close], a').forEach((element) => {
    element.addEventListener('click', () => mobileMenu.close());
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
    if (event.matches && mobileMenu.open) mobileMenu.close();
  });
}
