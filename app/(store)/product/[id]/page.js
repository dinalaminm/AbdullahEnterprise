'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { S, me, prod, disc, toggleWish, addToCart, openSheet, toast, trackRecent } from '../../../../lib/store/core';
import { money, dt } from '../../../../lib/store/helpers';
import { useStore, ProductCard, ProdImg, Stars, LoadBtn, Empty } from '../../../../components/store/ui';

export default function Product() {
  useStore();
  const router = useRouter();
  const { id } = useParams();
  const p = prod(id);
  const [opt, setOpt] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => { setOpt(''); setQty(1); if (prod(id)) trackRecent(id); }, [id]);

  if (!p) return <Empty text="Product not found" to="/" label="Go Home" />;
  const revs = S.reviews[p.id] || [], w = S.wish.includes(p.id);
  const related = S.products.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);

  const share = () => {
    const url = location.href;
    if (navigator.share) navigator.share({ title: p.name, url }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast('Link copied'), () => toast(url));
    else toast(url);
  };
  const review = () => {
    if (!me()) { toast('Please login to write a review'); router.push('/login?next=/product/' + p.id); return; }
    openSheet('review', { id: p.id });
  };

  return (
    <>
      <ProdImg p={p} className="pd-img" />
      <div className="card">
        <div className="pd-price">{money(p.price)}{p.old > p.price && <><span className="pd-old" style={{ fontSize: 14 }}>{money(p.old)}</span> <span className="tag warn">-{disc(p)}%</span></>}</div>
        <h2 style={{ fontSize: 16, fontWeight: 500, margin: '8px 0' }}>{p.name}</h2>
        <div className="row sp">
          <div><Stars r={p.rating} /> <span className="muted">{p.rating.toFixed(1)} ({p.reviews} ratings)</span></div>
          <div className="row">
            <LoadBtn onAct={share} style={{ fontSize: 18 }}><i className="fas fa-share-alt" /></LoadBtn>
            <LoadBtn className="heart-lg" onAct={() => toggleWish(p.id)} style={{ fontSize: 20, color: w ? '#e91e63' : '#777' }}><i className={(w ? 'fas' : 'far') + ' fa-heart'} /></LoadBtn>
          </div>
        </div>
        <div className="muted" style={{ marginTop: 6 }}>Brand: <b>{p.brand}</b> · Category: {p.cat}</div>
        <div style={{ marginTop: 6 }}>
          {p.stock > 5 ? <span className="tag ok">In stock</span> : p.stock > 0 ? <span className="tag warn">Only {p.stock} left</span> : <span className="tag bad">Out of stock</span>}
        </div>
      </div>
      {p.opts.length > 0 && (
        <div className="card"><b>Select option</b>
          <div className="opts" id="opts">{p.opts.map((o) => <span key={o} className={'opt' + (opt === o ? ' on' : '')} onClick={() => setOpt(o)}>{o}</span>)}</div>
        </div>
      )}
      <div className="card row sp"><b>Quantity</b>
        <div className="qty">
          <button onClick={() => setQty(Math.max(1, Math.min(p.stock || 1, qty - 1)))}>−</button><span id="pq">{qty}</span>
          <button onClick={() => setQty(Math.max(1, Math.min(p.stock || 1, qty + 1)))}>+</button>
        </div>
      </div>
      <div className="card"><b>Delivery</b>
        <div className="muted" style={{ marginTop: 6 }}>
          <i className="fas fa-truck" /> Dhaka area {money(S.settings.nearFee)} · Other districts {money(S.settings.farFee)}<br />
          <i className="fas fa-gift" /> Free delivery over {money(S.settings.freeShip)}<br />
          <i className="fas fa-hand-holding-usd" /> Cash on delivery available<br />
          <i className="fas fa-undo" /> 7 days easy return
        </div>
      </div>
      <div className="card"><b>Description</b><p style={{ marginTop: 6, lineHeight: 1.6, color: '#444' }}>{p.desc}</p></div>
      <div className="card">
        <div className="row sp"><b>Ratings &amp; Reviews ({revs.length})</b><LoadBtn className="btn line sm" onAct={review}>Write review</LoadBtn></div>
        {revs.length ? revs.slice().reverse().map((r, i) => (
          <div className="review" key={i}>
            <div><Stars r={r.rating} /> <b style={{ fontSize: 12 }}>{r.user}</b> {r.verified && <span className="tag ok">Verified</span>}</div>
            <div style={{ margin: '3px 0' }}>{r.text}</div><div className="muted">{dt(r.t)}</div>
          </div>
        )) : <div className="muted" style={{ marginTop: 8 }}>No reviews yet. Be the first!</div>}
      </div>
      {related.length > 0 && <><h3 className="section-title">You may also like</h3><div className="product-grid">{related.map((x) => <ProductCard key={x.id} p={x} />)}</div></>}
      <div style={{ height: 60 }} />
      <div className="pd-bar">
        <LoadBtn className="btn line" disabled={p.stock <= 0} onAct={() => { if (addToCart(p.id, qty, opt)) toast('Added to cart'); }}><i className="fas fa-cart-plus" /> Add to Cart</LoadBtn>
        <LoadBtn className="btn" disabled={p.stock <= 0} onAct={() => { if (addToCart(p.id, qty, opt)) router.push('/checkout'); }}>Buy Now</LoadBtn>
      </div>
    </>
  );
}
