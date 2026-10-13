'use client';
import { useRouter } from 'next/navigation';
import { S, disc } from '../../../lib/store/core';
import { CATS } from '../../../lib/store/constants';
import { useStore } from '../../../components/store/ui';

export default function Explore() {
  useStore();
  const router = useRouter();
  return (
    <>
      <h3 className="section-title">Categories</h3>
      <div className="product-grid">
        {[...CATS, { n: '', i: 'fa-th-large', c: 'c-4' }].map((c) => {
          const n = c.n === 'Offers' ? S.products.filter((p) => disc(p) >= 30).length : c.n ? S.products.filter((p) => p.cat === c.n).length : S.products.length;
          return (
            <div key={c.n || 'all'} className="card row" style={{ cursor: 'pointer', margin: 0 }} onClick={() => router.push('/list' + (c.n ? '?cat=' + c.n : ''))}>
              <div className={'icon-circle ' + c.c} style={{ margin: 0 }}><i className={'fas ' + c.i} /></div>
              <div><b>{c.n || 'All Products'}</b><div className="muted">{n} items</div></div>
            </div>
          );
        })}
      </div>
    </>
  );
}
