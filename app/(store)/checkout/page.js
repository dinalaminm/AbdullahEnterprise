'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { S, me, calc, placeOrder, toast } from '../../../lib/store/core';
import { DISTRICTS } from '../../../lib/store/constants';
import { money } from '../../../lib/store/helpers';
import { useStore, useSubmit, Empty } from '../../../components/store/ui';

export default function Checkout() {
  useStore();
  const router = useRouter();
  const u = me();
  const [dist, setDist] = useState(u?.district || 'Dhaka');
  const [pay, setPay] = useState('COD');
  const [submit, busy] = useSubmit((d) => {
    const o = placeOrder(d);
    if (o) router.push('/order/' + o.id + '?new=1');
  });
  useEffect(() => { if (!me()) { toast('Please login to checkout'); router.replace('/login?next=/checkout'); } }, [router]);
  if (!u) return null;
  const t = calc(dist);
  if (!t.L.length) return <Empty icon="fas fa-shopping-cart" text="Your cart is empty" to="/" label="Start Shopping" />;
  return (
    <form onSubmit={submit}>
      <div className="card"><b>Delivery information</b>
        <div style={{ marginTop: 10 }}>
          <div className="two">
            <label className="field"><span>Full name</span><input name="name" required defaultValue={u.name} /></label>
            <label className="field"><span>Mobile number</span><input name="phone" required inputMode="numeric" placeholder="01XXXXXXXXX" defaultValue={u.phone || ''} /></label>
          </div>
          <label className="field"><span>District</span>
            <select name="district" id="distSel" value={dist} onChange={(e) => setDist(e.target.value)}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
          </label>
          <label className="field"><span>Full address</span><textarea name="address" rows="2" required placeholder="House, road, area, thana" defaultValue={u.address || ''} /></label>
          <label className="field"><span>Order note (optional)</span><input name="note" /></label>
        </div>
      </div>
      <div className="card"><b>Payment method</b>
        <div style={{ marginTop: 10 }}>
          <label className="pay"><input type="radio" name="pay" value="COD" checked={pay === 'COD'} onChange={() => setPay('COD')} /><i className="fas fa-money-bill-wave" /> Cash on Delivery</label>
          {['bKash', 'Nagad', 'Rocket'].map((m) => (
            <label className="pay" key={m}><input type="radio" name="pay" value={m} checked={pay === m} onChange={() => setPay(m)} /><i className="fas fa-mobile-alt" /> {m}</label>
          ))}
          <div className={'payfields' + (pay !== 'COD' ? ' show' : '')} id="payf">
            <div className="card" style={{ background: '#fff7f2', marginBottom: 8 }}>Send <b>{money(t.total)}</b> via <b>{pay}</b> (Send Money) to <b>{S.settings.payNumber}</b>, then enter your details below.</div>
            <div className="two">
              <label className="field"><span>Your {pay} number</span><input name="sender" inputMode="numeric" placeholder="01XXXXXXXXX" /></label>
              <label className="field"><span>Transaction ID</span><input name="trx" style={{ textTransform: 'uppercase' }} /></label>
            </div>
          </div>
        </div>
      </div>
      <div className="card" id="cksum"><b>Order summary</b>
        {t.L.map((l) => <div className="sumrow" style={{ fontSize: 13 }} key={l.id + '|' + l.opt}><span>{l.p.name.slice(0, 34)}{l.opt ? ' (' + l.opt + ')' : ''} × {l.qty}</span><span>{money(l.p.price * l.qty)}</span></div>)}
        <div className="sumrow"><span>Subtotal</span><span>{money(t.sub)}</span></div>
        {t.disc ? <div className="sumrow" style={{ color: 'var(--ok)' }}><span>Discount ({S.coupon})</span><span>- {money(t.disc)}</span></div> : null}
        <div className="sumrow"><span>Delivery</span><span>{t.ship ? money(t.ship) : 'FREE'}</span></div>
        <div className="sumrow t"><span>Total</span><span style={{ color: 'var(--brand)' }}>{money(t.total)}</span></div>
      </div>
      <div className="card">
        <button className={'btn blk' + (busy ? ' loading' : '')} type="submit">Place Order</button>
        <div className="muted" style={{ marginTop: 6, textAlign: 'center' }}>By placing this order you agree to our terms and return policy.</div>
      </div>
    </form>
  );
}
