const body = document.body;
const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const themedSections = document.querySelectorAll('[data-theme]');
const revealItems = document.querySelectorAll('.reveal-on-scroll');

const closeMenu = () => {
  navMenu.classList.remove('is-open');
  body.classList.remove('menu-open');
  menuToggle.classList.remove('is-active');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Mở menu điều hướng');
};

const openMenu = () => {
  navMenu.classList.add('is-open');
  body.classList.add('menu-open');
  menuToggle.classList.add('is-active');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Đóng menu điều hướng');
};

menuToggle.addEventListener('click', () => {
  navMenu.classList.contains('is-open') ? closeMenu() : openMenu();
});

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));

    if (target) {
      const headerOffset = header.offsetHeight + 12;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }

    closeMenu();
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
});

const updateActiveLink = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
  });
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const theme = entry.target.dataset.theme;
    body.classList.toggle('theme-blue', theme === 'blue');
    body.classList.toggle('theme-rose', theme !== 'blue');
    updateActiveLink(entry.target.id);
  });
}, {
  rootMargin: '-35% 0px -45% 0px',
  threshold: 0.01,
});

themedSections.forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.14,
});

revealItems.forEach((item) => revealObserver.observe(item));
