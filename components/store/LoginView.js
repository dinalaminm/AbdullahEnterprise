'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doLogin, doRegister } from '../../lib/store/core';
import { href } from '../../lib/store/helpers';
import { useSubmit } from './ui';

export default function LoginView({ mode = 'in', next = '' }) {
  const router = useRouter();
  const reg = mode === 'reg';
  const [submit, busy] = useSubmit(async (d) => {
    const u = reg ? await doRegister(d) : await doLogin(d.login, d.pass);
    if (u) router.push(next || '/account');
  });
  return (
    <>
      <div className="hero" style={{ padding: '28px 16px' }}>
        <div><h2>Welcome to Abdullah Store</h2><div style={{ opacity: 0.9 }}>{reg ? 'Create a new account' : 'Login to your account'}</div></div>
      </div>
      <div className="card" style={{ marginTop: 8 }}>
        <form onSubmit={submit} key={mode}>
          {reg && <label className="field"><span>Full name</span><input name="name" required /></label>}
          <label className="field"><span>{reg ? 'Mobile number or email' : 'Mobile number / email / username'}</span><input name="login" required autoComplete="username" /></label>
          <label className="field"><span>Password</span><input name="pass" type="password" required minLength={reg ? 6 : 1} autoComplete={reg ? 'new-password' : 'current-password'} /></label>
          {reg && <label className="field"><span>Confirm password</span><input name="pass2" type="password" required /></label>}
          <button className={'btn blk' + (busy ? ' loading' : '')} type="submit">{reg ? 'Create account' : 'Login'}</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          {reg
            ? <>Already a member? <Link href={href('/login', { next })} style={{ color: 'var(--brand)', fontWeight: 700 }}>Login</Link></>
            : <>New here? <Link href={href('/login', { m: 'reg', next })} style={{ color: 'var(--brand)', fontWeight: 700 }}>Register</Link></>}
        </div>
      </div>
    </>
  );
}
