/* Visual effects: scroll-reveal for new elements + material-style ripple. Pure DOM, no React state. */
const REVEAL = '.product-card,.card,.flash-sale,.shortcut-icons,.vouchers,.trust>div,.menu,.stat>div,.review,.fs-item,details,.chips,.banner';
const RIPPLE = '.btn,.chip,.more,.opt,.voucher,.menu a,.menu .mi';

export function startFx() {
  if (typeof window === 'undefined' || window.__fx) return () => {};
  window.__fx = true;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.getElementById('app');
  let io, mo;

  if (!reduce && 'IntersectionObserver' in window && root) {
    io = new IntersectionObserver((entries) => {
      let k = 0;
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--d', Math.min(k++, 8) * 0.05 + 's');
        e.target.setAttribute('data-rv', 'in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -4% 0px' });
    const scan = (node) => {
      if (node.nodeType !== 1) return;
      const list = node.matches && node.matches(REVEAL) ? [node, ...node.querySelectorAll(REVEAL)] : node.querySelectorAll ? [...node.querySelectorAll(REVEAL)] : [];
      list.forEach((el) => { if (!el.hasAttribute('data-rv')) { el.setAttribute('data-rv', ''); io.observe(el); } });
    };
    scan(root);
    mo = new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach(scan)));
    mo.observe(root, { childList: true, subtree: true });
  }

  const onDown = (e) => {
    const el = e.target.closest && e.target.closest(RIPPLE);
    if (!el || el.disabled) return;
    const r = el.getBoundingClientRect(), size = Math.max(r.width, r.height);
    const s = document.createElement('span');
    s.className = 'ripple';
    s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    el.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  };
  if (!reduce) document.addEventListener('pointerdown', onDown, { passive: true });

  return () => { io && io.disconnect(); mo && mo.disconnect(); document.removeEventListener('pointerdown', onDown); window.__fx = false; };
}
