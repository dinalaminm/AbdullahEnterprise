'use client';
import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { S, subscribeStore, getVersion, toast, prod, disc, toggleWish, addToCart } from '../../lib/store/core';
import { money, svgImg, pimg, sleep } from '../../lib/store/helpers';

/* re-render the calling component whenever store state changes */
export function useStore() {
  return useSyncExternalStore(subscribeStore, getVersion, () => 0);
}

/* button with the same 350ms spinner the original used */
export function LoadBtn({ onAct, className = '', children, ...rest }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      {...rest}
      className={className + (busy ? ' loading' : '')}
      onClick={(e) => {
        e.stopPropagation();
        if (busy) return;
        setBusy(true);
        setTimeout(async () => { try { await onAct(); } finally { setBusy(false); } }, 350);
      }}
    >
      {children}
    </button>
  );
}

/* form submit helper: reads FormData, shows spinner, reports errors as toast */
export function useSubmit(fn) {
  const [busy, setBusy] = useState(false);
  const onSubmit = (e) => {
    e.preventDefault();
    if (busy) return;
    const f = e.currentTarget;
    const data = Object.fromEntries(new FormData(f));
    setBusy(true);
    sleep(350)
      .then(() => fn(data, f))
      .catch((err) => { console.error(err); toast('Error: ' + (err.code || err.message)); })
      .finally(() => setBusy(false));
  };
  return [onSubmit, busy];
}

export function Stars({ r }) {
  const out = [];
  for (let i = 1; i <= 5; i++) {
    if (r >= i) out.push(<i key={i} className="fas fa-star" />);
    else if (r >= i - 0.5) out.push(<i key={i} className="fas fa-star-half-alt" />);
    else out.push(<i key={i} className="far fa-star e" />);
  }
  return <span className="stars">{out}</span>;
}

export function ProdImg({ p, className = '' }) {
  const [fb, setFb] = useState(false);
  const [ok, setOk] = useState(false);
  return (
    <img
      className={className + (ok ? ' loaded' : '')}
      src={fb ? svgImg(p) : pimg(p)}
      alt={p.name}
      loading="lazy"
      ref={(el) => { if (el && el.complete && el.naturalWidth) setOk(true); }}
      onLoad={() => setOk(true)}
      onError={() => { setFb(true); setOk(false); }}
    />
  );
}

export function Empty({ icon = 'fas fa-box-open', text, to, label }) {
  const router = useRouter();
  return (
    <div className="empty">
      <i className={icon} />{text}<br />
      {to && <a className="btn" href={to} onClick={(e) => { e.preventDefault(); router.push(to); }}>{label}</a>}
    </div>
  );
}

export function ProductCard({ p }) {
  useStore();
  const router = useRouter();
  const d = disc(p), w = S.wish.includes(p.id);
  const quickAdd = () => {
    const x = prod(p.id);
    if (x.opts.length) { router.push('/product/' + x.id); toast('Select an option'); return; }
    if (addToCart(x.id)) toast('Added to cart');
  };
  return (
    <div className="product-card" onClick={() => router.push('/product/' + p.id)}>
      <div className="pimg">
        <ProdImg p={p} />
        {d ? <span className="dbadge">-{d}%</span> : null}
        <LoadBtn className={'heart ' + (w ? 'on' : '')} onAct={() => toggleWish(p.id)}><i className={(w ? 'fas' : 'far') + ' fa-heart'} /></LoadBtn>
        {p.stock <= 0 ? <div className="oos">Sold Out</div> : null}
      </div>
      <div className="p-details">
        <div className="p-title">{p.name}</div>
        <div><span className="p-price">{money(p.price)}</span>{p.old > p.price ? <span className="p-old-price">{money(p.old)}</span> : null}</div>
        <div className="p-rating"><Stars r={p.rating} /><span>({p.reviews})</span></div>
        {p.price * 1 >= S.settings.freeShip ? <div className="free-delivery">Free Delivery</div> : null}
      </div>
      {p.stock > 0 ? <LoadBtn className="qadd" onAct={quickAdd}><i className="fas fa-cart-plus" /></LoadBtn> : null}
    </div>
  );
}
