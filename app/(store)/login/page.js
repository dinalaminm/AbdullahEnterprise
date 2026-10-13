'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginView from '../../../components/store/LoginView';

function View() {
  const sp = useSearchParams();
  return <LoginView mode={sp.get('m') === 'reg' ? 'reg' : 'in'} next={sp.get('next') || ''} />;
}
export default function Page() { return <Suspense><View /></Suspense>; }
