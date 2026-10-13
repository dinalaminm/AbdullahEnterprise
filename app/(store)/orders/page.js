'use client';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { S, me } from '../../../lib/store/core';
import { money, dt, href, svgImg } from '../../../lib/store/helpers';
import { useStore, useSubmit, Empty } from '../../../components/store/ui';
import { StBadge } from '../../../components/store/orderbits';
import LoginView from '../../../components/store/LoginView';

function Orders() {
  useStore();
  const router = useRouter();
  const q = useSearchParams();
  const [submit, busy] = useSubmit((d) => { router.push(href('/orders', { s: (d.s || '').trim().toUpperCase() })); });
  const u = me();
  if (!u) return <LoginView next="/orders" />;
  const f = q.get('f') || 'all', s = (q.get('s') || '').trim().toUpperCase();
  let L = S.orders.filter((o) => o.uid === u.id).sort((a, b) => b.t - a.t);
  if (f === 'active') L = L.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
  if (f === 'done') L = L.filter((o) => o.status === 'Delivered');
  if (f === 'cancel') L = L.filter((o) => o.status === 'Cancelled');
  if (s) L = L.filter((o) => o.id.includes(s));
  return (
    <>
      <form onSubmit={submit} className="card row" key={q.get('s') || ''}>
        <input name="s" defaultValue={q.get('s') || ''} placeholder="Track by order ID" style={{ flex: 1, padding: 10, border: '1px solid var(--line)', borderRadius: 4 }} />
        <button className={'btn' + (busy ? ' loading' : '')} type="submit">Track</button>
      </form>
      <div className="chips">
        {[['all', 'All'], ['active', 'Active'], ['done', 'Delivered'], ['cancel', 'Cancelled']].map(([k, l]) => (
          <span key={k} className={'chip ' + (f === k ? 'on' : '')} onClick={() => router.push(href('/orders', { f: k === 'all' ? '' : k, s: q.get('s') || '' }))}>{l}</span>
        ))}
      </div>
      {L.length ? L.map((o) => (
        <div key={o.id} className="card" onClick={() => router.push('/order/' + o.id)} style={{ cursor: 'pointer', marginTop: 6 }}>
          <div className="row sp"><b>#{o.id}</b><StBadge s={o.status} /></div>
          <div className="muted">{dt(o.t)} · {o.items.reduce((a, i) => a + i.qty, 0)} items</div>
          <div className="row" style={{ margin: '8px 0', overflow: 'hidden' }}>
            {o.items.slice(0, 4).map((i, k) => <img key={k} src={svgImg(i)} alt="" style={{ width: 44, height: 44, borderRadius: 4 }} />)}
          </div>
          <div className="row sp"><span className="muted">{o.pay.method}</span><b style={{ color: 'var(--brand)' }}>{money(o.total)}</b></div>
        </div>
      )) : <Empty text="No orders found" to="/" label="Shop now" />}
    </>
  );
}
export default function Page() { return <Suspense><Orders /></Suspense>; }
