const menuWrap = document.querySelector(".menu-wrap");
const hamburger = document.querySelector(".hamburger");
const dropdownLinks = document.querySelectorAll("[data-menu-link]");
const allNavLinks = document.querySelectorAll(".nav-link, [data-menu-link]");
const backToTop = document.querySelector(".back-to-top");
const mobileCall = document.querySelector("[data-call-button]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setMenuState = (isOpen) => {
  if (!menuWrap || !hamburger) return;
  menuWrap.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
};

hamburger?.addEventListener("click", (event) => {
  event.stopPropagation();
  setMenuState(!menuWrap?.classList.contains("is-open"));
});

dropdownLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

document.addEventListener("click", (event) => {
  if (menuWrap && !menuWrap.contains(event.target)) {
    setMenuState(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);
  }
});

mobileCall?.addEventListener("click", () => {
  window.location.href = "tel:0905111223";
});

const scrollToHash = (hash) => {
  const target = document.querySelector(hash);
  if (!target) return;
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
};

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;
    const target = document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    scrollToHash(hash);
    history.pushState(null, "", hash);
  });
});

const sections = Array.from(document.querySelectorAll(".section-anchor[id]"));
const setActiveLink = (id) => {
  allNavLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActiveLink(visible.target.id);
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: [0.08, 0.2, 0.45] },
  );
  sections.forEach((section) => observer.observe(section));
}

const carousel = document.querySelector("[data-carousel]");
if (carousel) {
  const viewport = carousel.querySelector(".carousel-viewport");
  const track = carousel.querySelector(".carousel-track");
  const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
  const prevButton = carousel.querySelector(".carousel-btn--prev");
  const nextButton = carousel.querySelector(".carousel-btn--next");
  const dotsWrap = carousel.querySelector(".carousel-dots");
  let currentIndex = 0;
  let slideWidth = 0;
  let startX = 0;
  let currentX = 0;
  let dragOffset = 0;
  let isDragging = false;
  let autoplayId = null;

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Xem banner ${index + 1}`);
    dot.addEventListener("click", () => goToSlide(index));
    dotsWrap?.appendChild(dot);
  });

  const dots = Array.from(dotsWrap?.querySelectorAll("button") || []);

  const measure = () => {
    slideWidth = viewport?.clientWidth || 0;
  };

  const update = (animate = true) => {
    if (!track) return;
    measure();
    track.style.transition = animate ? "transform 420ms ease" : "none";
    track.style.transform = `translate3d(${currentIndex * -slideWidth + dragOffset}px, 0, 0)`;
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentIndex);
      dot.setAttribute("aria-current", index === currentIndex ? "true" : "false");
    });
  };

  const goToSlide = (index, animate = true) => {
    currentIndex = (index + slides.length) % slides.length;
    dragOffset = 0;
    update(animate);
  };

  const stopAutoplay = () => {
    if (autoplayId) window.clearInterval(autoplayId);
    autoplayId = null;
  };

  const startAutoplay = () => {
    if (reduceMotion || slides.length < 2) return;
    stopAutoplay();
    autoplayId = window.setInterval(() => goToSlide(currentIndex + 1), 4500);
  };

  const pointerX = (event) => event.clientX ?? event.touches?.[0]?.clientX ?? 0;

  const startDrag = (event) => {
    if (!viewport) return;
    isDragging = true;
    startX = pointerX(event);
    currentX = startX;
    dragOffset = 0;
    carousel.classList.add("is-dragging");
    document.body.classList.add("is-dragging");
    stopAutoplay();
    update(false);
  };

  const moveDrag = (event) => {
    if (!isDragging) return;
    currentX = pointerX(event);
    dragOffset = currentX - startX;
    update(false);
  };

  const endDrag = () => {
    if (!isDragging) return;
    const threshold = Math.max(55, slideWidth * 0.16);
    isDragging = false;
    carousel.classList.remove("is-dragging");
    document.body.classList.remove("is-dragging");
    if (dragOffset <= -threshold) {
      goToSlide(currentIndex + 1);
    } else if (dragOffset >= threshold) {
      goToSlide(currentIndex - 1);
    } else {
      goToSlide(currentIndex);
    }
    startAutoplay();
  };

  prevButton?.addEventListener("click", () => {
    goToSlide(currentIndex - 1);
    startAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    goToSlide(currentIndex + 1);
    startAutoplay();
  });

  viewport?.addEventListener("pointerdown", (event) => {
    viewport.setPointerCapture?.(event.pointerId);
    startDrag(event);
  });
  viewport?.addEventListener("pointermove", moveDrag);
  viewport?.addEventListener("pointerup", endDrag);
  viewport?.addEventListener("pointercancel", endDrag);
  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", () => {
    if (!isDragging) startAutoplay();
  });
  window.addEventListener("resize", () => update(false));

  update(false);
  startAutoplay();
}

const selectedSizeText = document.querySelector(".selected-size span");
document.querySelectorAll(".size-pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    document.querySelectorAll(".size-pill").forEach((button) => {
      const isActive = button === pill;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    selectedSizeText.textContent = pill.dataset.size || pill.textContent.trim();
  });
});

window.addEventListener("scroll", () => {
  backToTop?.classList.toggle("is-visible", window.scrollY > 600);
});

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});
