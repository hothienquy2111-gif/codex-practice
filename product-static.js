(() => {
  document.querySelectorAll('[data-static-gallery]').forEach((gallery) => {
    const mainImage = gallery.querySelector('[data-static-gallery-main]');
    const thumbnails = gallery.querySelectorAll('[data-static-gallery-thumb]');
    if (!mainImage || !thumbnails.length) return;

    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener('click', () => {
        const image = thumbnail.dataset.image;
        if (!image) return;
        mainImage.src = image;
        mainImage.alt = thumbnail.dataset.alt || mainImage.alt;
        thumbnails.forEach((item) => item.removeAttribute('aria-current'));
        thumbnail.setAttribute('aria-current', 'true');
      });
    });
  });
})();
