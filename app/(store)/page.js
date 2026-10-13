'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { S, COUPONS, prod, disc, setCoupon, toast } from '../../lib/store/core';
import { CATS, SLIDES } from '../../lib/store/constants';
import { money } from '../../lib/store/helpers';
import { useStore, ProductCard, ProdImg, LoadBtn } from '../../components/store/ui';

const flashEnd = () => { const n = 8 * 3600e3; return Math.ceil(Date.now() / n) * n; };

function FlashTimer() {
  const [s, setS] = useState(null);
  useEffect(() => {
    const f = () => setS(Math.max(0, Math.floor((flashEnd() - Date.now()) / 1000)));
    f(); const i = setInterval(f, 1000); return () => clearInterval(i);
  }, []);
  const p = (n) => String(n).padStart(2, '0');
  return (
    <div className="timer">
      {s !== null && <>Ending in <span>{p(Math.floor(s / 3600))}</span>:<span>{p(Math.floor((s % 3600) / 60))}</span>:<span>{p(s % 60)}</span></>}
    </div>
  );
}

function Banner() {
  const router = useRouter();
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 3500); return () => clearInterval(t); }, []);
  return (
    <section className="banner">
      <div className="slides" id="slides" style={{ transform: `translateX(-${i * 100}%)` }}>
        {SLIDES.map((s) => (
          <div key={s.t} className="slide" style={{ background: s.bg }} onClick={() => router.push(s.go)}>
            <div><h2>{s.t}</h2><p>{s.p}</p><span className="cta">Shop Now</span></div>
            <div className="big">{s.e}</div>
          </div>
        ))}
      </div>
      <div className="dots" id="dots">{SLIDES.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
    </section>
  );
}

export default function Home() {
  useStore();
  const router = useRouter();
  const [shown, setShown] = useState(8);
  const fl = S.products.filter((p) => p.flash && p.stock > 0);
  const rec = S.recent.map(prod).filter(Boolean).slice(0, 8);
  return (
    <>
      <Banner />
      <section className="shortcut-icons">
        {CATS.map((c) => (
          <div key={c.n} className="icon-item" onClick={() => router.push('/list?cat=' + c.n)}>
            <div className={'icon-circle ' + c.c}><i className={'fas ' + c.i} /></div><span>{c.n}</span>
          </div>
        ))}
      </section>
      <section className="vouchers">
        {Object.entries(COUPONS).map(([k, v]) => (
          <div key={k} className="voucher" onClick={() => { setCoupon(k); toast(`Coupon ${k} applied to your cart`); }}>
            <b>{k}</b>{v.note}<br /><span className="muted">Tap to apply</span>
          </div>
        ))}
      </section>
      {fl.length > 0 && (
        <section className="flash-sale">
          <div className="fs-header">
            <h3><i className="fas fa-bolt" /> Flash Sale</h3><FlashTimer />
            <Link href="/list?cat=Offers" className="see-more">Shop More &gt;</Link>
          </div>
          <div className="fs-items-container">
            {fl.map((p) => (
              <div key={p.id} className="fs-item" onClick={() => router.push('/product/' + p.id)}>
                <ProdImg p={p} /><div className="fs-price">{money(p.price)}</div><div className="fs-old">{money(p.old)} · -{disc(p)}%</div>
              </div>
            ))}
          </div>
        </section>
      )}
      {rec.length > 0 && (
        <section className="flash-sale">
          <div className="fs-header"><h3 style={{ color: 'var(--text)' }}>Recently Viewed</h3></div>
          <div className="fs-items-container">
            {rec.map((p) => (
              <div key={p.id} className="fs-item" onClick={() => router.push('/product/' + p.id)}><ProdImg p={p} /><div className="fs-price">{money(p.price)}</div></div>
            ))}
          </div>
        </section>
      )}
      <section className="just-for-you">
        <h3 className="section-title">Just For You</h3>
        <div className="product-grid" id="jfy">{S.products.slice(0, shown).map((p) => <ProductCard key={p.id} p={p} />)}</div>
        <LoadBtn className="more" id="jfyMore" style={{ display: shown >= S.products.length ? 'none' : 'block' }} onAct={() => setShown(shown + 8)}>Load more</LoadBtn>
      </section>
    </>
  );
}
