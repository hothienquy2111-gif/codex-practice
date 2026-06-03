const body = document.body;
const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('#primary-menu');
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const sectionTargets = Array.from(document.querySelectorAll('[data-theme]'));
const revealTargets = Array.from(document.querySelectorAll('.reveal-on-scroll'));

const closeMenu = () => {
  if (!menuToggle || !navMenu) return;

  menuToggle.classList.remove('is-active');
  navMenu.classList.remove('is-open');
  body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Mở menu điều hướng');
};

const openMenu = () => {
  if (!menuToggle || !navMenu) return;

  menuToggle.classList.add('is-active');
  navMenu.classList.add('is-open');
  body.classList.add('menu-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Đóng menu điều hướng');
};

const updateHeaderState = () => {
  body.classList.toggle('is-scrolled', window.scrollY > 24);
};

const setTheme = (theme) => {
  body.classList.toggle('theme-blue', theme === 'blue');
  body.classList.toggle('theme-rose', theme !== 'blue');
};

const updateScrollScene = () => {
  const hero = document.querySelector('#trang-chu');
  const products = document.querySelector('#cac-dong-tivi');

  if (!hero || !products) return;

  const start = hero.offsetTop + hero.offsetHeight * 0.4;
  const end = products.offsetTop + products.offsetHeight * 0.2;
  const progress = Math.min(Math.max((window.scrollY - start) / (end - start), 0), 1);

  body.style.setProperty('--scroll-progress', progress.toFixed(3));
  body.style.setProperty('--rose-shift', `${(-70 * progress).toFixed(1)}px`);
  body.style.setProperty('--rose-scale', (1 - 0.02 * progress).toFixed(3));
  body.style.setProperty('--ocean-shift', `${(60 - 60 * progress).toFixed(1)}px`);
  body.style.setProperty('--ocean-scale', (1.04 - 0.04 * progress).toFixed(3));
  setTheme(progress > 0.35 ? 'blue' : 'rose');
};

const updateActiveLink = () => {
  const headerOffset = header ? header.offsetHeight + 80 : 120;
  let currentId = 'trang-chu';

  sectionTargets.forEach((section) => {
    if (window.scrollY + headerOffset >= section.offsetTop) {
      currentId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
  });
};

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  isOpen ? closeMenu() : openMenu();
});

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    const target = targetId ? document.querySelector(targetId) : null;

    if (!target) return;

    event.preventDefault();
    const headerOffset = header ? header.offsetHeight + 10 : 90;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });

    closeMenu();
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
});

const revealObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 })
  : null;

if (revealObserver) {
  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add('is-visible'));
}

let ticking = false;
const handleScroll = () => {
  if (ticking) return;

  window.requestAnimationFrame(() => {
    updateHeaderState();
    updateScrollScene();
    updateActiveLink();
    ticking = false;
  });

  ticking = true;
};

window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', handleScroll);
window.addEventListener('load', () => {
  revealTargets.slice(0, 2).forEach((target) => target.classList.add('is-visible'));
  handleScroll();
});

handleScroll();
