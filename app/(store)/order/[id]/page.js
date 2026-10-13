'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { S, me, cancelOrder, reorder } from '../../../../lib/store/core';
import { money, dt, svgImg } from '../../../../lib/store/helpers';
import { useStore, LoadBtn, Empty } from '../../../../components/store/ui';
import { StBadge, Timeline } from '../../../../components/store/orderbits';
import LoginView from '../../../../components/store/LoginView';

function Order() {
  useStore();
  const router = useRouter();
  const { id } = useParams();
  const isNew = useSearchParams().get('new');
  const u = me();
  if (!u) return <LoginView next="/orders" />;
  const o = S.orders.find((x) => x.id === id && (x.uid === u.id || u.role === 'admin'));
  if (!o) return <Empty text="Order not found" to="/orders" label="My orders" />;
  return (
    <>
      {isNew && <div className="card" style={{ textAlign: 'center', background: '#e8f5e9' }}><i className="fas fa-check-circle" style={{ fontSize: 44, color: 'var(--ok)' }} /><h3 style={{ marginTop: 6 }}>Order placed successfully!</h3><div className="muted">Thank you for shopping with Abdullah Store</div></div>}
      <div className="card"><div className="row sp"><b>Order #{o.id}</b><StBadge s={o.status} /></div><div className="muted">Placed on {dt(o.t)}</div><Timeline o={o} /></div>
      <div className="card"><b>Items</b>
        {o.items.map((i, k) => (
          <div className="cl" key={k}>
            <img src={svgImg(i)} alt="" />
            <div className="info"><div className="nm"><Link href={'/product/' + i.id}>{i.name}</Link></div>{i.opt && <div className="muted">Option: {i.opt}</div>}<div className="muted">{money(i.price)} × {i.qty}</div></div>
            <b>{money(i.price * i.qty)}</b>
          </div>
        ))}
      </div>
      <div className="card"><b>Delivery address</b>
        <div style={{ marginTop: 6 }}>{o.ship.name} · {o.ship.phone}<br />{o.ship.address}, {o.ship.district}{o.ship.note && <><br /><span className="muted">Note: {o.ship.note}</span></>}</div>
      </div>
      <div className="card"><b>Payment</b>
        <div style={{ marginTop: 6 }}>{o.pay.method} · <span className={'tag ' + (o.pay.status === 'Paid' ? 'ok' : 'warn')}>{o.pay.status}</span>{o.pay.trx && <><br /><span className="muted">TrxID: {o.pay.trx} · From: {o.pay.sender}</span></>}</div>
      </div>
      <div className="card">
        <div className="sumrow"><span>Subtotal</span><span>{money(o.sub)}</span></div>
        {o.disc ? <div className="sumrow" style={{ color: 'var(--ok)' }}><span>Discount {o.coupon ? '(' + o.coupon + ')' : ''}</span><span>- {money(o.disc)}</span></div> : null}
        <div className="sumrow"><span>Delivery</span><span>{o.ship_fee ? money(o.ship_fee) : 'FREE'}</span></div>
        <div className="sumrow t"><span>Total</span><span style={{ color: 'var(--brand)' }}>{money(o.total)}</span></div>
      </div>
      <div className="card noprint">
        <div className="two">
          <LoadBtn className="btn line" onAct={() => window.print()}>Print invoice</LoadBtn>
          <LoadBtn className="btn line" onAct={() => { if (reorder(o.id)) router.push('/cart'); }}>Reorder</LoadBtn>
        </div>
        {['Pending', 'Confirmed'].includes(o.status) && o.uid === u.id && (
          <LoadBtn className="btn red blk" style={{ marginTop: 8 }} onAct={() => { if (confirm('Cancel this order?')) cancelOrder(o.id); }}>Cancel order</LoadBtn>
        )}
      </div>
    </>
  );
}
export default function Page() { return <Suspense><Order /></Suspense>; }
