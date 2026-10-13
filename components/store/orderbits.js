'use client';
import { STATUS } from '../../lib/store/constants';

export const StBadge = ({ s }) => <span className={'tag ' + (s === 'Delivered' ? 'ok' : s === 'Cancelled' ? 'bad' : s === 'Pending' ? 'warn' : 'info')}>{s}</span>;

export function Timeline({ o }) {
  if (o.status === 'Cancelled') return <div className="card" style={{ color: 'var(--err)' }}><i className="fas fa-times-circle" /> This order was cancelled.</div>;
  const idx = STATUS.indexOf(o.status);
  return (
    <div className="tl">
      {STATUS.map((s, i) => <div key={s} className={'st ' + (i <= idx ? 'done' : '')}><i className={'fas fa-' + (i <= idx ? 'check' : 'circle')} />{s.replace('Out for Delivery', 'On the way')}</div>)}
    </div>
  );
}
