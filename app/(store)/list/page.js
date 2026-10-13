'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { S, disc, openSheet } from '../../../lib/store/core';
import { CATS } from '../../../lib/store/constants';
import { href } from '../../../lib/store/helpers';
import { useStore, ProductCard, LoadBtn, Empty } from '../../../components/store/ui';

function List({ qs }) {
  useStore();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const q = new URLSearchParams(qs);
  const cat = q.get('cat') || '', term = (q.get('q') || '').trim().toLowerCase(), sort = q.get('sort') || 'rel';
  const min = +q.get('min') || 0, max = +q.get('max') || 0, mr = +q.get('rating') || 0, st = q.get('stock') === '1';
  const off = q.get('offer') === '1' || cat === 'Offers';
  const toks = term.split(/\s+/).filter(Boolean);
  const r = S.products.filter((p) => {
    if (cat && cat !== 'Offers' && p.cat !== cat) return false;
    const hay = (p.name + ' ' + p.brand + ' ' + p.cat).toLowerCase();
    if (!toks.every((t) => hay.includes(t))) return false;
    if (min && p.price < min) return false; if (max && p.price > max) return false;
    if (p.rating < mr) return false; if (st && p.stock <= 0) return false; if (off && disc(p) < 30) return false;
    return true;
  });
  const sorters = { price_asc: (a, b) => a.price - b.price, price_desc: (a, b) => b.price - a.price, new: (a, b) => b.added - a.added, rating: (a, b) => b.rating - a.rating, disc: (a, b) => disc(b) - disc(a) };
  if (sorters[sort]) r.sort(sorters[sort]);
  const shown = r.slice(0, page * 8);
  const base = { cat, q: q.get('q') || '', sort: q.get('sort') || '', min: q.get('min') || '', max: q.get('max') || '', rating: q.get('rating') || '', stock: q.get('stock') || '' };
  return (
    <>
      <div className="chips">
        <span className={'chip ' + (!cat ? 'on' : '')} onClick={() => router.push(href('/list', { ...base, cat: '' }))}>All</span>
        {CATS.map((c) => <span key={c.n} className={'chip ' + (cat === c.n ? 'on' : '')} onClick={() => router.push(href('/list', { ...base, cat: c.n }))}>{c.n}</span>)}
      </div>
      <div className="card row sp" style={{ marginBottom: 6 }}>
        <span className="muted">{r.length} result{r.length === 1 ? '' : 's'}{term ? ` for "${term}"` : ''}</span>
        <div className="row">
          <select id="sortSel" value={sort} style={{ padding: 6, border: '1px solid var(--line)', borderRadius: 4 }}
            onChange={(e) => router.push(href('/list', { ...base, sort: e.target.value === 'rel' ? '' : e.target.value }))}>
            {[['rel', 'Relevance'], ['price_asc', 'Price: Low to High'], ['price_desc', 'Price: High to Low'], ['new', 'Newest'], ['rating', 'Top Rated'], ['disc', 'Biggest Discount']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <LoadBtn className="btn line sm" onAct={() => openSheet('filter', { qs })}><i className="fas fa-filter" /> Filter</LoadBtn>
        </div>
      </div>
      {r.length ? (
        <>
          <div className="product-grid">{shown.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          {shown.length < r.length && <LoadBtn className="more" onAct={() => setPage(page + 1)}>Load more</LoadBtn>}
        </>
      ) : <Empty icon="fas fa-search" text="No products found" to="/list" label="Clear filters" />}
    </>
  );
}

function View() {
  const qs = useSearchParams().toString();
  return <List key={qs} qs={qs} />;
}
export default function Page() { return <Suspense><View /></Suspense>; }
