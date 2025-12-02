export function flyToCart(sourceEl) {
  try {
    if (!sourceEl) return;
    const targetEl = document.querySelector('a[aria-label="Cart"]');
    if (!targetEl) return;

    const sRect = sourceEl.getBoundingClientRect();
    const tRect = targetEl.getBoundingClientRect();

    const clone = sourceEl.cloneNode(true);
    clone.classList.add('fly-clone');
    clone.style.left = `${sRect.left}px`;
    clone.style.top = `${sRect.top}px`;
    clone.style.width = `${sRect.width}px`;
    clone.style.height = `${sRect.height}px`;
    clone.style.borderRadius = '12px';
    clone.style.opacity = '0.9';
    clone.style.transform = 'translate3d(0,0,0) scale(1)';
    document.body.appendChild(clone);

    const dx = tRect.left + tRect.width / 2 - (sRect.left + sRect.width / 2);
    const dy = tRect.top + tRect.height / 2 - (sRect.top + sRect.height / 2);

    requestAnimationFrame(() => {
      clone.style.transition = 'transform 600ms cubic-bezier(.22,.61,.36,1), opacity 600ms ease';
      clone.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(0.15)`;
      clone.style.opacity = '0.2';
    });

    const cleanup = () => clone.remove();
    clone.addEventListener('transitionend', cleanup, { once: true });
    setTimeout(cleanup, 800);
  } catch {}
}
