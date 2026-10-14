'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { S, me, openSheet, doLogout } from '../../../lib/store/core';
import { useStore } from '../../../components/store/ui';
import LoginView from '../../../components/store/LoginView';

const Go = () => <i className="fas fa-chevron-right go" />;

export default function Account() {
  useStore();
  const router = useRouter();
  const u = me();
  if (!u) return <LoginView />;
  const my = S.orders.filter((o) => o.uid === u.id);
  return (
    <>
      <div className="hero"><div className="avatar">{(u.name[0] || 'U').toUpperCase()}</div><div><b style={{ fontSize: 16 }}>{u.name}</b><div style={{ opacity: 0.9, fontSize: 12 }}>{u.login}</div></div></div>
      <div className="stat" style={{ padding: 8 }}><div><b>{my.length}</b>Orders</div><div><b>{S.wish.length}</b>Wishlist</div></div>
      <div className="menu">
        <Link href="/orders"><i className="fas fa-box" />My Orders<Go /></Link>
        <Link href="/wishlist"><i className="fas fa-heart" />My Wishlist<Go /></Link>
        <div className="mi" onClick={() => openSheet('profile')}><i className="fas fa-user-edit" />Edit Profile &amp; Address<Go /></div>
        <div className="mi" onClick={() => openSheet('passwd')}><i className="fas fa-key" />Change Password<Go /></div>
        <div className="mi" onClick={() => openSheet('help')}><i className="fas fa-headset" />Help &amp; Support<Go /></div>
        <div className="mi" style={{ color: 'var(--err)' }} onClick={() => { doLogout(); router.push('/'); }}><i className="fas fa-sign-out-alt" style={{ color: 'var(--err)' }} />Logout</div>
      </div>
    </>
  );
}
