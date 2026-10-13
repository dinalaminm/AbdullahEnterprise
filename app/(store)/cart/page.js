'use client';
import { useRouter } from 'next/navigation';
import { S, COUPONS, calc, cartCount, cartQty, cartRemove, cartToWish, setCoupon, toast } from '../../../lib/store/core';
import { money } from '../../../lib/store/helpers';
import { useStore, useSubmit, ProdImg, Empty } from '../../../components/store/ui';

export default function Cart() {
  useStore();
  const router = useRouter();
  const t = calc('');
  const [submit, busy] = useSubmit((d) => {
    const c = (d.code || '').trim().toUpperCase();
    if (!c) { setCoupon(''); return; }
    if (!COUPONS[c]) { toast('Invalid coupon code'); return; }
    setCoupon(c);
  });
  if (!t.L.length) return <Empty icon="fas fa-shopping-cart" text="Your cart is empty" to="/" label="Start Shopping" />;
  return (
    <>
      <div className="card">
        {t.L.map((l) => (
          <div className="cl" key={l.id + '|' + l.opt}>
            <ProdImg p={l.p} />
            <div className="info" onClick={() => router.push('/product/' + l.p.id)}>
              <div className="nm">{l.p.name}</div>
              {l.opt && <div className="muted">Option: {l.opt}</div>}
              <div className="p-price">{money(l.p.price)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="qty">
                <button onClick={() => cartQty(l.id, l.opt, -1)}>−</button><span>{l.qty}</span><button onClick={() => cartQty(l.id, l.opt, 1)}>+</button>
              </div>
              <div style={{ marginTop: 8, fontSize: 12 }}>
                <button title="Move to wishlist" onClick={() => cartToWish(l.id, l.opt)}><i className="far fa-heart" /></button> &nbsp;
                <button style={{ color: 'var(--err)' }} onClick={() => cartRemove(l.id, l.opt)}><i className="fas fa-trash" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <form onSubmit={submit} className="row" key={S.coupon}>
          <input name="code" defaultValue={S.coupon} placeholder="Coupon code" style={{ flex: 1, padding: 10, border: '1px solid var(--line)', borderRadius: 4, textTransform: 'uppercase' }} />
          <button className={'btn' + (busy ? ' loading' : '')} type="submit">Apply</button>
        </form>
        {S.coupon && (t.cerr
          ? <div style={{ color: 'var(--err)', marginTop: 6 }}>{t.cerr}</div>
          : <div style={{ color: 'var(--ok)', marginTop: 6 }}>{S.coupon} applied <button onClick={() => setCoupon('')} style={{ color: 'var(--err)', marginLeft: 8 }}>remove</button></div>)}
      </div>
      <div className="card">
        <div className="sumrow"><span>Subtotal ({cartCount()} items)</span><span>{money(t.sub)}</span></div>
        {t.disc ? <div className="sumrow" style={{ color: 'var(--ok)' }}><span>Discount</span><span>- {money(t.disc)}</span></div> : null}
        <div className="sumrow"><span>Delivery</span><span className="muted">Calculated at checkout</span></div>
        <div className="sumrow t"><span>Total</span><span style={{ color: 'var(--brand)' }}>{money(t.sub - t.disc)}</span></div>
        <a className="btn blk" style={{ marginTop: 10 }} href="/checkout" onClick={(e) => { e.preventDefault(); router.push('/checkout'); }}>Proceed to Checkout</a>
      </div>
    </>
  );
}
