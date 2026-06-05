const menuWrap = document.querySelector(".menu-wrap");
const menuButton = document.querySelector(".hamburger");
const menuLinks = document.querySelectorAll(".menu-dropdown a");

function setMenu(open) {
  menuWrap.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open && window.innerWidth <= 640);
  menuButton.setAttribute("aria-expanded", String(open));
}

menuButton.addEventListener("click", () => {
  setMenu(!menuWrap.classList.contains("is-open"));
});

menuLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("click", (event) => {
  if (!menuWrap.contains(event.target)) {
    setMenu(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 640) {
    document.body.classList.remove("menu-open");
  }
});

const carousel = document.querySelector("[data-carousel]");
const track = carousel.querySelector(".carousel-track");
const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
const prevButton = carousel.querySelector(".carousel-arrow-prev");
const nextButton = carousel.querySelector(".carousel-arrow-next");
const dots = Array.from(carousel.querySelectorAll(".dot"));

let currentIndex = 0;
let autoplayId = null;
let isDragging = false;
let startX = 0;
let currentTranslate = 0;
let dragOffset = 0;

function slideWidth() {
  return carousel.querySelector(".carousel-viewport").clientWidth;
}

function updateCarousel(animate = true) {
  track.style.transition = animate ? "" : "none";
  currentTranslate = -currentIndex * slideWidth();
  track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;

  dots.forEach((dot, index) => {
    const active = index === currentIndex;
    dot.classList.toggle("is-active", active);
    dot.setAttribute("aria-current", active ? "true" : "false");
  });
}

function goToSlide(index) {
  currentIndex = (index + slides.length) % slides.length;
  updateCarousel();
}

function nextSlide() {
  goToSlide(currentIndex + 1);
}

function prevSlide() {
  goToSlide(currentIndex - 1);
}

function startAutoplay() {
  stopAutoplay();
  autoplayId = window.setInterval(nextSlide, 4500);
}

function stopAutoplay() {
  if (autoplayId) {
    window.clearInterval(autoplayId);
    autoplayId = null;
  }
}

prevButton.addEventListener("click", () => {
  prevSlide();
  startAutoplay();
});

nextButton.addEventListener("click", () => {
  nextSlide();
  startAutoplay();
});

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    goToSlide(index);
    startAutoplay();
  });
});

carousel.addEventListener("mouseenter", stopAutoplay);
carousel.addEventListener("mouseleave", () => {
  if (!isDragging) {
    startAutoplay();
  }
});

function dragStart(event) {
  if (
    event.target.closest("button") ||
    (event.pointerType === "mouse" && event.button !== 0)
  ) {
    return;
  }

  isDragging = true;
  startX = event.clientX;
  dragOffset = 0;
  carousel.classList.add("is-dragging");
  stopAutoplay();
  carousel.setPointerCapture(event.pointerId);
}

function dragMove(event) {
  if (!isDragging) {
    return;
  }

  dragOffset = event.clientX - startX;
  track.style.transform = `translate3d(${currentTranslate + dragOffset}px, 0, 0)`;
}

function dragEnd(event) {
  if (!isDragging) {
    return;
  }

  const threshold = slideWidth() * 0.16;
  isDragging = false;
  carousel.classList.remove("is-dragging");

  if (Math.abs(dragOffset) > threshold) {
    goToSlide(currentIndex + (dragOffset < 0 ? 1 : -1));
  } else {
    updateCarousel();
  }

  carousel.releasePointerCapture(event.pointerId);
  startAutoplay();
}

carousel.addEventListener("pointerdown", dragStart);
carousel.addEventListener("pointermove", dragMove);
carousel.addEventListener("pointerup", dragEnd);
carousel.addEventListener("pointercancel", dragEnd);
carousel.addEventListener("lostpointercapture", () => {
  if (isDragging) {
    isDragging = false;
    carousel.classList.remove("is-dragging");
    updateCarousel();
    startAutoplay();
  }
});

window.addEventListener("resize", () => updateCarousel(false));

updateCarousel(false);
startAutoplay();

const sizePills = Array.from(document.querySelectorAll(".size-pill"));
const selectedSizeText = document.querySelector(".selected-size span");

sizePills.forEach((pill) => {
  if (!pill.hasAttribute("aria-pressed")) {
    pill.setAttribute("aria-pressed", "false");
  }

  pill.addEventListener("click", () => {
    const selectedSize = pill.dataset.size;

    sizePills.forEach((button) => {
      const isActive = button === pill;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (selectedSizeText && selectedSize) {
      selectedSizeText.textContent = selectedSize;
    }
  });
});
