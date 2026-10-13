/* Store data layer: one mutable state object (S) + change notifications for React.
   Same Supabase sync logic as the original app; views only read S and call the functions below. */
import { SupaCompat } from '../supabase-compat';
import { SEED, DEFAULT_COUPONS, NEAR } from './constants';
import { money } from './helpers';

/* ---------- local storage with in-memory fallback ---------- */
const mem = {};
export const store = {
  get(k, d) { try { const v = localStorage.getItem('as_' + k); return v !== null ? JSON.parse(v) : d; } catch (e) { return k in mem ? mem[k] : d; } },
  set(k, v) { mem[k] = v; try { localStorage.setItem('as_' + k, JSON.stringify(v)); } catch (e) {} }
};

/* ---------- state ---------- */
export const COUPONS = { ...DEFAULT_COUPONS };
const DEFAULT_SETTINGS = { payNumber: '01XXXXXXXXX', phone: '01XXXXXXXXX', freeShip: 1500, nearFee: 60, farFee: 110 };
export const S = {
  products: null, users: null, orders: [], cart: [], wish: [], session: null, recent: [],
  reviews: {}, msgs: [], searches: [], coupon: '', settings: { ...DEFAULT_SETTINGS }
};
export const ui = { ready: false, toast: '', showToast: false, sheet: null };

let version = 0;
const listeners = new Set();
export const emit = () => { version++; listeners.forEach((f) => f()); };
export const subscribeStore = (f) => { listeners.add(f); return () => listeners.delete(f); };
export const getVersion = () => version;

let toastT;
export function toast(m) {
  ui.toast = m; ui.showToast = true; emit();
  clearTimeout(toastT);
  toastT = setTimeout(() => { ui.showToast = false; emit(); }, 2200);
}
export const openSheet = (name, props = {}) => { ui.sheet = { name, props }; emit(); };
export const closeSheet = () => { ui.sheet = null; emit(); };

/* ---------- Supabase sync ---------- */
let db = null;
const COL = { products: 'products', orders: 'orders', msgs: 'messages', reviews: 'reviews', users: 'users' };
const last = {};
let unsubs = [];
const sj = (o) => JSON.stringify(o, (k, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v).sort().reduce((a, x) => (a[x] = v[x], a), {}) : v);
function docsOf(k) {
  if (k === 'reviews') return Object.entries(S.reviews).map(([id, list]) => ({ id, list }));
  return S[k].map((x) => { if (!x.id) x.id = 'm' + x.t + Math.random().toString(36).slice(2, 6); return x; });
}
function rebase(k) { const m = {}; docsOf(k).forEach((d) => (m[d.id] = sj(d))); last[k] = m; }
function pushSync(k) {
  const prev = last[k] || {}, map = {}, b = db.batch(); let n = 0;
  docsOf(k).forEach((d) => (map[d.id] = sj(d)));
  for (const id in map) if (prev[id] !== map[id]) { b.set(db.collection(COL[k]).doc(id), JSON.parse(map[id])); n++; }
  if (k === 'products') for (const id in prev) if (!(id in map)) { b.delete(db.collection(COL[k]).doc(id)); n++; }
  last[k] = map;
  if (n) b.commit().catch((e) => { console.error(e); toast('Database error: ' + (e.code || e.message)); });
}
export function save(k) {
  store.set(k, S[k]);
  if (db) {
    if (COL[k]) pushSync(k);
    else if (k === 'settings') db.collection('settings').doc('main').set(S.settings).catch((e) => toast('Database error: ' + (e.code || e.message)));
  }
  emit();
}
let rfT;
function remoteRefresh() { clearTimeout(rfT); rfT = setTimeout(emit, 200); }

export const me = () => S.users && S.users.find((u) => u.id === S.session);
export const prod = (id) => S.products && S.products.find((p) => p.id === id);
export const disc = (p) => (p.old > p.price ? Math.round(((p.old - p.price) / p.old) * 100) : 0);

export function subscribeDb() {
  unsubs.forEach((f) => { try { f(); } catch (e) {} }); unsubs = [];
  if (!db) return;
  const u = me();
  const listen = (k, query, apply) => unsubs.push(query.onSnapshot((snap) => {
    apply(snap.docs.map((d) => ({ ...d.data(), id: d.id }))); rebase(k); store.set(k, S[k]); remoteRefresh();
  }, (e) => console.warn(k, e.code, e.message)));
  listen('products', db.collection('products'), (d) => { S.products = d.sort((a, b) => (b.added || 0) - (a.added || 0)); });
  listen('reviews', db.collection('reviews'), (d) => { S.reviews = {}; d.forEach((x) => (S.reviews[x.id] = x.list || [])); });
  unsubs.push(db.collection('settings').doc('main').onSnapshot((s) => { if (s.exists) { S.settings = { ...S.settings, ...s.data() }; store.set('settings', S.settings); remoteRefresh(); } }, (e) => console.warn('settings', e.code)));
  unsubs.push(db.collection('coupons').onSnapshot((s) => {
    if (!s.empty) {
      Object.keys(COUPONS).forEach((k) => delete COUPONS[k]);
      s.docs.forEach((d) => { const c = d.data(); if (c.active !== false) COUPONS[d.id] = { type: c.type, val: +c.val || 0, max: +c.max || 0, min: +c.min || 0, note: c.note || '' }; });
    }
    remoteRefresh();
  }, (e) => console.warn('coupons', e.code)));
  if (u) listen('orders', db.collection('orders').where('uid', '==', u.id), (d) => { S.orders = d; });
  else S.orders = [];
}

async function fetchUser(l) {
  if (db) {
    const s = await db.collection('users').where('login', '==', l).limit(1).get();
    if (s.empty) return null;
    const u = { ...s.docs[0].data(), id: s.docs[0].id }, i = S.users.findIndex((x) => x.id === u.id);
    if (i >= 0) S.users[i] = u; else S.users.push(u);
    (last.users = last.users || {})[u.id] = sj(u);
    return u;
  }
  return S.users.find((x) => x.login === l) || null;
}
async function sha(s) {
  try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); }
  catch (e) { return 'x' + btoa(unescape(encodeURIComponent(s))); }
}

/* ---------- init ---------- */
function loadLocal() {
  const g = store.get;
  Object.assign(S, {
    products: g('products', null), users: g('users', null), orders: g('orders', []), cart: g('cart', []), wish: g('wish', []),
    session: g('session', null), recent: g('recent', []), reviews: g('reviews', {}), msgs: g('msgs', []),
    searches: g('searches', []), coupon: g('coupon', ''), settings: g('settings', { ...DEFAULT_SETTINGS })
  });
}
async function localInit() {
  if (!S.products) { S.products = SEED; save('products'); }
  if (!S.users) { S.users = []; save('users'); }
}
async function dbInit() {
  const ps = await db.collection('products').get();
  if (ps.empty) {
    const b = db.batch();
    SEED.forEach((p) => b.set(db.collection('products').doc(p.id), JSON.parse(JSON.stringify(p))));
    b.set(db.collection('settings').doc('main'), S.settings);
    try { await b.commit(); } catch (e) { console.warn('seed skipped (add products from admin panel)', e.message); }
    S.products = SEED.slice();
  } else S.products = ps.docs.map((d) => ({ ...d.data(), id: d.id })).sort((a, b) => (b.added || 0) - (a.added || 0));
  rebase('products');
  const st = await db.collection('settings').doc('main').get();
  if (st.exists) S.settings = { ...S.settings, ...st.data() };
  S.orders = []; S.msgs = []; S.users = []; S.reviews = {}; last.users = {};
  if (S.session) {
    const u = await db.collection('users').doc(S.session).get();
    if (u.exists) { const o = { ...u.data(), id: u.id }; S.users = [o]; last.users[o.id] = sj(o); }
    else { S.session = null; save('session'); }
  }
  subscribeDb();
}
let initP;
export function init() { return initP || (initP = _init()); }
async function _init() {
  loadLocal();
  try { db = SupaCompat().db; } catch (e) { console.warn('Supabase init failed', e); db = null; }
  if (db) {
    try { await Promise.race([dbInit(), new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 12000))]); }
    catch (e) {
      console.warn('Database unavailable, using local mode:', e);
      unsubs.forEach((f) => { try { f(); } catch (x) {} }); unsubs = []; db = null;
      setTimeout(() => toast('Offline mode: database not reachable'), 500);
    }
  }
  if (!db) {
    S.products = store.get('products', null); S.users = store.get('users', null); S.orders = store.get('orders', []);
    S.msgs = store.get('msgs', []); S.reviews = store.get('reviews', {});
    await localInit();
  }
  ui.ready = true; emit();
}

/* ---------- cart / totals ---------- */
export const lines = () => S.cart.map((c) => { const p = prod(c.id); return p ? { ...c, p } : null; }).filter(Boolean);
export const cartCount = () => S.cart.reduce((a, c) => a + c.qty, 0);
export function calc(district) {
  const L = lines(), sub = L.reduce((a, l) => a + l.p.price * l.qty, 0);
  const c = COUPONS[S.coupon]; let d = 0, freeShip = false, cerr = '';
  if (S.coupon && !c) cerr = 'Invalid coupon';
  else if (c) {
    if (sub < c.min) cerr = `Minimum order ${money(c.min)} required`;
    else if (c.type === 'pct') d = Math.min((sub * c.val) / 100, c.max || Infinity);
    else if (c.type === 'flat') d = c.val;
    else freeShip = true;
  }
  d = Math.min(d, sub);
  let ship = 0;
  if (L.length && district) {
    ship = NEAR.includes(district) ? S.settings.nearFee : S.settings.farFee;
    if (sub - d >= S.settings.freeShip || freeShip) ship = 0;
  }
  return { L, sub, disc: d, ship, total: sub - d + ship, cerr };
}
export function addToCart(id, qty = 1, opt = '') {
  const p = prod(id);
  if (!p || p.stock <= 0) { toast('Out of stock'); return false; }
  if (p.opts.length && !opt) { toast('Please select an option'); return false; }
  const ex = S.cart.find((c) => c.id === id && c.opt === opt);
  const cur = ex ? ex.qty : 0;
  if (cur + qty > p.stock) { toast(`Only ${p.stock} in stock`); return false; }
  if (ex) ex.qty += qty; else S.cart.push({ id, qty, opt });
  save('cart'); return true;
}
export function cartQty(id, opt, d) {
  const c = S.cart.find((x) => x.id === id && x.opt === opt), p = prod(id), n = c.qty + d;
  if (n < 1) return;
  if (n > p.stock) { toast(`Only ${p.stock} in stock`); return; }
  c.qty = n; save('cart');
}
export function cartRemove(id, opt) { S.cart = S.cart.filter((x) => !(x.id === id && x.opt === opt)); save('cart'); }
export function cartToWish(id, opt) { if (!S.wish.includes(id)) { S.wish.push(id); save('wish'); } cartRemove(id, opt); toast('Moved to wishlist'); }
export function toggleWish(id) {
  const i = S.wish.indexOf(id);
  if (i >= 0) { S.wish.splice(i, 1); toast('Removed from wishlist'); } else { S.wish.push(id); toast('Added to wishlist'); }
  save('wish');
}
export function setCoupon(code) { S.coupon = code; save('coupon'); }

/* ---------- auth / account ---------- */
export const BDPHONE = /^(?:\+?88)?01[3-9]\d{8}$/;
const normLogin = (s) => { s = s.trim().toLowerCase(); return /^\+?\d[\d\s-]+$/.test(s) ? s.replace(/[\s-]/g, '').replace(/^\+?88/, '') : s; };
export async function doLogin(raw, pass) {
  const l = normLogin(raw), h = await sha(pass);
  let u; try { u = await fetchUser(l); } catch (e) { toast('Database error: ' + (e.code || e.message)); return null; }
  if (!u || u.pass !== h) { toast('Wrong login or password'); return null; }
  S.session = u.id; save('session'); subscribeDb(); toast('Welcome back, ' + u.name);
  return u;
}
export async function doRegister(d) {
  const l = normLogin(d.login);
  if (!BDPHONE.test(l) && !/^\S+@\S+\.\S+$/.test(l) && !/^01[3-9]\d{8}$/.test(l)) { toast('Enter a valid mobile number or email'); return null; }
  if (d.pass !== d.pass2) { toast('Passwords do not match'); return null; }
  try { if (await fetchUser(l)) { toast('This account already exists'); return null; } } catch (e) { toast('Database error: ' + (e.code || e.message)); return null; }
  const u = { id: 'u' + Date.now(), name: d.name.trim(), login: l, pass: await sha(d.pass), role: 'user', phone: /@/.test(l) ? '' : l, address: '', district: 'Dhaka', joined: Date.now() };
  S.users.push(u); save('users'); S.session = u.id; save('session'); subscribeDb(); toast('Account created');
  return u;
}
export function doLogout() { S.session = null; save('session'); if (db) S.orders = []; subscribeDb(); toast('Logged out'); }
export function updateProfile(d) {
  const u = me(); Object.assign(u, { name: d.name.trim(), phone: d.phone.trim(), district: d.district, address: d.address.trim() });
  save('users'); toast('Profile updated');
}
export async function changePassword(oldP, newP) {
  const u = me();
  if (u.pass !== (await sha(oldP))) { toast('Current password is wrong'); return false; }
  u.pass = await sha(newP); save('users'); toast('Password changed'); return true;
}

/* ---------- orders ---------- */
export function placeOrder(d) {
  const u = me(), dist = d.district, t = calc(dist);
  const phone = d.phone.trim().replace(/[\s-]/g, '');
  if (!BDPHONE.test(phone)) { toast('Enter a valid Bangladeshi mobile number'); return null; }
  if (t.cerr) { toast(t.cerr); return null; }
  const method = d.pay, trx = (d.trx || '').trim().toUpperCase(), sender = (d.sender || '').trim();
  if (method !== 'COD') {
    if (!BDPHONE.test(sender)) { toast('Enter your ' + method + ' number'); return null; }
    if (trx.length < 6) { toast('Enter a valid transaction ID'); return null; }
    if (S.orders.some((o) => o.pay.trx && o.pay.trx === trx)) { toast('This transaction ID was already used'); return null; }
  }
  for (const l of t.L) if (l.qty > l.p.stock) { toast(`${l.p.name.slice(0, 25)}: only ${l.p.stock} left`); return null; }
  const o = {
    id: 'AS' + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 90 + 10), uid: u.id, t: Date.now(), status: 'Pending', hist: [{ s: 'Pending', t: Date.now() }],
    items: t.L.map((l) => ({ id: l.id, name: l.p.name, price: l.p.price, qty: l.qty, opt: l.opt, emoji: l.p.emoji, color: l.p.color })),
    ship: { name: d.name.trim(), phone, district: dist, address: d.address.trim(), note: (d.note || '').trim() },
    pay: { method, trx: method === 'COD' ? '' : trx, sender: method === 'COD' ? '' : sender, status: method === 'COD' ? 'Unpaid (COD)' : 'Verification pending' },
    sub: t.sub, disc: t.disc, coupon: t.disc || COUPONS[S.coupon]?.type === 'ship' ? S.coupon : '', ship_fee: t.ship, total: t.total
  };
  t.L.forEach((l) => (l.p.stock -= l.qty)); save('products');
  S.orders.push(o); save('orders');
  Object.assign(u, { name: o.ship.name, phone, district: dist, address: o.ship.address }); save('users');
  S.cart = []; S.coupon = ''; save('cart'); save('coupon');
  return o;
}
function setStatus(o, s) {
  if (o.status === s) return;
  if (s === 'Cancelled' && o.status !== 'Cancelled') { o.items.forEach((i) => { const p = prod(i.id); if (p) p.stock += i.qty; }); save('products'); }
  if (o.status === 'Cancelled' && s !== 'Cancelled') { o.items.forEach((i) => { const p = prod(i.id); if (p) p.stock = Math.max(0, p.stock - i.qty); }); save('products'); }
  o.status = s; o.hist.push({ s, t: Date.now() });
}
export function cancelOrder(id) {
  const o = S.orders.find((x) => x.id === id);
  if (!o || !['Pending', 'Confirmed'].includes(o.status)) return;
  setStatus(o, 'Cancelled'); save('orders'); toast('Order cancelled');
}
export function reorder(id) {
  const o = S.orders.find((x) => x.id === id); let n = 0;
  o.items.forEach((i) => { if (prod(i.id) && addToCart(i.id, i.qty, i.opt)) n++; });
  if (n) toast('Items added to cart');
  return n;
}

/* ---------- reviews / messages / search ---------- */
export function addReview(id, rating, text) {
  const u = me(), p = prod(id);
  const list = (S.reviews[id] = S.reviews[id] || []);
  if (list.some((r) => r.uid === u.id)) { toast('You have already reviewed this product'); return; }
  const verified = S.orders.some((o) => o.uid === u.id && o.status === 'Delivered' && o.items.some((i) => i.id === id));
  list.push({ uid: u.id, user: u.name, rating, text: text.trim(), t: Date.now(), verified }); save('reviews');
  p.rating = (p.rating * p.reviews + rating) / (p.reviews + 1); p.reviews++; save('products');
  toast('Thanks for your review!');
}
export function sendMsg(d) {
  S.msgs.push({ name: d.name.trim(), phone: d.phone.trim(), text: d.text.trim(), t: Date.now(), read: false });
  save('msgs'); toast('Message sent. We will contact you soon.');
}
export function rememberSearch(v) {
  S.searches = [v, ...S.searches.filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, 6); save('searches');
}
export function trackRecent(id) { S.recent = [id, ...S.recent.filter((x) => x !== id)].slice(0, 12); save('recent'); }
