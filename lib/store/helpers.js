export const money = (n) => '৳ ' + Math.round(n || 0).toLocaleString('en-US');
export const dt = (t) => new Date(t).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function svgImg(p) {
  const s = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${p.color || '#ddd'}'/><stop offset='1' stop-color='#ffffff'/></linearGradient></defs><rect width='200' height='200' fill='url(#g)'/><text x='100' y='128' font-size='90' text-anchor='middle'>${p.emoji || '🛍️'}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(s);
}
export const pimg = (p) => p.image || svgImg(p);

export function href(path, params = {}) {
  const u = new URLSearchParams();
  for (const k in params) if (params[k] !== '' && params[k] != null && params[k] !== 0) u.set(k, params[k]);
  const s = u.toString();
  return path + (s ? '?' + s : '');
}
