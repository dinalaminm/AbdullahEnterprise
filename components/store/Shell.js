'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { S, ui, init, toast, openSheet, closeSheet, cartCount, rememberSearch } from '../../lib/store/core';
import { useStore } from './ui';
import { startFx } from '../../lib/store/fx';
import Sheet from './Sheet';

function Header() {
  useStore();
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const n = cartCount();

  useEffect(() => { setQ(path === '/list' ? sp.get('q') || '' : ''); setOpen(false); }, [path, sp]);
  useEffect(() => {
    const h = (e) => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  const doSearch = (v = q) => {
    v = v.trim(); if (!v) return;
    rememberSearch(v); setOpen(false); router.push('/list?q=' + encodeURIComponent(v));
  };
  const voice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('Voice search is not supported in this browser'); return; }
    const r = new SR(); r.lang = 'en-US';
    r.onresult = (e) => { const t = e.results[0][0].transcript; setQ(t); doSearch(t); };
    r.onerror = () => toast('Could not hear you');
    r.start(); toast('Listening...');
  };
  const v = q.trim().toLowerCase();
  const matches = v && S.products ? S.products.filter((p) => (p.name + ' ' + p.brand).toLowerCase().includes(v)).slice(0, 6) : [];
  const go = (to) => { setOpen(false); router.push(to); };

  return (
    <header className="top-header" ref={wrap}>
      <div className="search-container">
        <button className="back-btn" id="backBtn" style={{ display: path === '/' ? 'none' : 'block' }}
          onClick={() => (window.history.length > 1 ? router.back() : router.push('/'))}><i className="fas fa-arrow-left" /></button>
        <div className="search-box">
          <i className="fas fa-search search-icon" />
          <input type="text" id="q" placeholder="Search in Abdullah Store" autoComplete="off" value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } }} />
          <i className="fas fa-microphone mic-icon" title="Voice search" onClick={voice} />
        </div>
        <div className="header-icons">
          <div className="hi" onClick={() => go('/cart')}><i key={"i" + n} className="fas fa-shopping-cart" /><span key={"b" + n} className="hbadge" id="hCart" style={{ display: n ? 'flex' : 'none' }}>{n}</span></div>
          <div className="hi" onClick={() => openSheet('help')}><i className="fas fa-comment-dots" /></div>
        </div>
      </div>
      <div className={'suggest' + (open && (v ? true : S.searches.length) ? ' show' : '')} id="suggest">
        {!v && S.searches.length > 0 && <div className="sh">Recent searches</div>}
        {!v && S.searches.map((s) => <div key={s} onClick={() => go('/list?q=' + encodeURIComponent(s))}><i className="fas fa-history" />{s}</div>)}
        {v ? matches.map((p) => <div key={p.id} onClick={() => go('/product/' + p.id)}><i className="fas fa-search" />{p.name}</div>) : null}
        {v ? <div onClick={() => go('/list?q=' + encodeURIComponent(q.trim()))}><i className="fas fa-arrow-right" />Search &quot;{q.trim()}&quot;</div> : null}
      </div>
    </header>
  );
}

function BottomNav() {
  useStore();
  const router = useRouter();
  const path = usePathname();
  const n = cartCount();
  const seg = path.split('/')[1] || 'home';
  const map = { home: 'home', explore: 'explore', list: 'explore', product: '', cart: 'cart', checkout: 'cart', account: 'account', login: 'account', orders: 'account', order: 'account', wishlist: 'account' };
  const active = map[seg] ?? 'home';
  const item = (key, to, icon, label, badge) => (
    <div className={'nav-item' + (active === key ? ' active' : '')} onClick={() => router.push(to)}>
      {badge ? <div className="cart-badge-wrapper"><i className={icon} /><span key={n} className="badge" id="nCart" style={{ display: n ? 'flex' : 'none' }}>{n}</span></div> : <i className={icon} />}
      <span>{label}</span>
    </div>
  );
  return (
    <nav className="bottom-nav" id="bnav">
      {item('home', '/', 'fas fa-home', 'Home')}
      {item('explore', '/explore', 'fas fa-compass', 'Explore')}
      {item('cart', '/cart', 'fas fa-shopping-cart', 'Cart', true)}
      {item('account', '/account', 'fas fa-user', 'Account')}
    </nav>
  );
}

function Skeleton() {
  return (
    <>
      <div className="sk sk-banner" />
      <div className="sk sk-row" />
      <div className="sk-grid">{[0, 1, 2, 3].map((k) => <div key={k} className="sk sk-card" />)}</div>
    </>
  );
}

function Footer() {
  const router = useRouter();
  return (
    <footer className="site-footer">
      <div className="ft-top">
        <div className="ft-brand">
          <b><span className="ft-logo">🛍️</span>Abdullah Store</b>
          Quality products, honest prices and fast delivery across Bangladesh.
        </div>
        <div className="ft-col"><h4>Shop</h4><span onClick={() => router.push('/')}>Home</span><span onClick={() => router.push('/explore')}>All categories</span><span onClick={() => router.push('/list?cat=Offers')}>Offers</span></div>
        <div className="ft-col"><h4>Support</h4><span onClick={() => router.push('/orders')}>Track order</span><span onClick={() => openSheet('help')}>Help &amp; contact</span><span>{S.settings.phone}</span></div>
      </div>
      <div className="ft-pay"><span>Cash on Delivery</span><span>bKash</span><span>Nagad</span><span>Rocket</span></div>
      <div className="ft-copy">© {new Date().getFullYear()} Abdullah Store. All rights reserved.</div>
    </footer>
  );
}

export default function Shell({ children }) {
  useStore();
  useEffect(() => { init(); const stop = startFx(); return stop; }, []);
  return (
    <>
      <Suspense fallback={<header className="top-header" />}><Header /></Suspense>
      <main id="app">{ui.ready ? children : <Skeleton />}</main>
      {ui.ready && <Footer />}
      <BottomNav />
      <div id="sheet" className={ui.sheet ? 'show' : ''} onClick={(e) => { if (e.target.id === 'sheet') closeSheet(); }}>
        <div className="box" id="sheetBox">{ui.sheet ? <Sheet name={ui.sheet.name} {...ui.sheet.props} /> : null}</div>
      </div>
      <div id="toast" className={ui.showToast ? 'show' : ''}>{ui.toast}</div>
    </>
  );
}
