const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
const revealItems = document.querySelectorAll('.reveal-on-scroll');

const closeMenu = () => {
  if (!menuToggle || !navMenu) return;

  menuToggle.classList.remove('is-open');
  navMenu.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Mở menu điều hướng');
};

const openMenu = () => {
  if (!menuToggle || !navMenu) return;

  menuToggle.classList.add('is-open');
  navMenu.classList.add('is-open');
  document.body.classList.add('menu-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Đóng menu điều hướng');
};

const toggleMenu = () => {
  const isOpen = menuToggle?.classList.contains('is-open');
  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
};

const updateHeaderState = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 8);
};

const setActiveLink = () => {
  const offset = (header?.offsetHeight || 0) + 120;
  let currentId = sections[0]?.id;

  sections.forEach((section) => {
    const top = section.getBoundingClientRect().top + window.scrollY - offset;
    if (window.scrollY >= top) {
      currentId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
  });
};

menuToggle?.addEventListener('click', toggleMenu);

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;

    event.preventDefault();
    closeMenu();

    const headerHeight = header?.offsetHeight || 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    });
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 780) {
    closeMenu();
  }
});

window.addEventListener('scroll', () => {
  updateHeaderState();
  setActiveLink();
}, { passive: true });

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.16,
    rootMargin: '0px 0px -40px 0px',
  });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

updateHeaderState();
setActiveLink();
