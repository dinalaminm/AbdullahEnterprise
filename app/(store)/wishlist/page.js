'use client';
import { S, prod } from '../../../lib/store/core';
import { useStore, ProductCard, Empty } from '../../../components/store/ui';

export default function Wishlist() {
  useStore();
  const L = S.wish.map(prod).filter(Boolean);
  if (!L.length) return <Empty icon="far fa-heart" text="Your wishlist is empty" to="/" label="Browse products" />;
  return (
    <>
      <h3 className="section-title">My Wishlist ({L.length})</h3>
      <div className="product-grid">{L.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </>
  );
}
