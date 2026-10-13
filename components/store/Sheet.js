'use client';
import { useRouter } from 'next/navigation';
import { S, me, closeSheet, sendMsg, addReview, updateProfile, changePassword } from '../../lib/store/core';
import { DISTRICTS } from '../../lib/store/constants';
import { href } from '../../lib/store/helpers';
import { useSubmit } from './ui';

const Faq = ({ q, a }) => <details><summary>{q}</summary><p className="muted" style={{ marginTop: 6 }}>{a}</p></details>;

function Help() {
  const u = me();
  const [submit, busy] = useSubmit((d) => { sendMsg(d); closeSheet(); });
  return (
    <>
      <h3>Help &amp; Support</h3>
      <Faq q="How do I place an order?" a="Add products to the cart, go to checkout, fill in your delivery details and choose a payment method." />
      <Faq q="Which payment methods are accepted?" a="Cash on Delivery, bKash, Nagad and Rocket." />
      <Faq q="How can I track or cancel my order?" a="Go to Account → My Orders. Orders can be cancelled while Pending or Confirmed." />
      <Faq q="Return policy" a="Unused products can be returned within 7 days of delivery." />
      <p className="muted" style={{ margin: '8px 0' }}><i className="fas fa-phone" /> {S.settings.phone}</p>
      <form onSubmit={submit}>
        <label className="field"><span>Your name</span><input name="name" required defaultValue={u ? u.name : ''} /></label>
        <label className="field"><span>Phone</span><input name="phone" required defaultValue={u ? u.phone || '' : ''} /></label>
        <label className="field"><span>Message</span><textarea name="text" rows="3" required /></label>
        <div className="two"><button type="button" className="btn line" onClick={closeSheet}>Close</button><button className={'btn' + (busy ? ' loading' : '')}>Send message</button></div>
      </form>
    </>
  );
}

function Filter({ qs }) {
  const router = useRouter();
  const q = new URLSearchParams(qs);
  const keep = { cat: q.get('cat') || '', q: q.get('q') || '' };
  const [submit, busy] = useSubmit((d) => {
    closeSheet();
    router.push(href('/list', { ...keep, sort: q.get('sort') || '', min: d.min, max: d.max, rating: d.rating, stock: d.stock ? '1' : '' }));
  });
  return (
    <>
      <h3>Filter products</h3>
      <form onSubmit={submit}>
        <div className="two">
          <label className="field"><span>Min price</span><input name="min" type="number" min="0" defaultValue={q.get('min') || ''} /></label>
          <label className="field"><span>Max price</span><input name="max" type="number" min="0" defaultValue={q.get('max') || ''} /></label>
        </div>
        <label className="field"><span>Minimum rating</span>
          <select name="rating" defaultValue={q.get('rating') || ''}>
            {[['', 'Any'], ['4', '4★ & up'], ['3', '3★ & up'], ['2', '2★ & up']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="row" style={{ marginBottom: 12 }}><input type="checkbox" name="stock" defaultChecked={q.get('stock') === '1'} /> In stock only</label>
        <div className="two">
          <button type="button" className="btn line" onClick={() => { closeSheet(); router.push(href('/list', keep)); }}>Clear</button>
          <button className={'btn' + (busy ? ' loading' : '')}>Apply</button>
        </div>
      </form>
    </>
  );
}

function Review({ id }) {
  const [submit, busy] = useSubmit((d) => { addReview(id, +d.rating, d.text); closeSheet(); });
  return (
    <>
      <h3>Write a review</h3>
      <form onSubmit={submit}>
        <label className="field"><span>Rating</span>
          <select name="rating">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</option>)}</select>
        </label>
        <label className="field"><span>Your review</span><textarea name="text" rows="3" required /></label>
        <div className="two"><button type="button" className="btn line" onClick={closeSheet}>Cancel</button><button className={'btn' + (busy ? ' loading' : '')}>Submit</button></div>
      </form>
    </>
  );
}

function Profile() {
  const u = me();
  const [submit, busy] = useSubmit((d) => { updateProfile(d); closeSheet(); });
  return (
    <>
      <h3>Edit profile</h3>
      <form onSubmit={submit}>
        <label className="field"><span>Full name</span><input name="name" required defaultValue={u.name} /></label>
        <label className="field"><span>Mobile number</span><input name="phone" defaultValue={u.phone || ''} /></label>
        <label className="field"><span>District</span><select name="district" defaultValue={u.district || 'Dhaka'}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></label>
        <label className="field"><span>Default address</span><textarea name="address" rows="2" defaultValue={u.address || ''} /></label>
        <div className="two"><button type="button" className="btn line" onClick={closeSheet}>Cancel</button><button className={'btn' + (busy ? ' loading' : '')}>Save</button></div>
      </form>
    </>
  );
}

function Passwd() {
  const [submit, busy] = useSubmit(async (d) => { if (await changePassword(d.old, d.n1)) closeSheet(); });
  return (
    <>
      <h3>Change password</h3>
      <form onSubmit={submit}>
        <label className="field"><span>Current password</span><input name="old" type="password" required /></label>
        <label className="field"><span>New password</span><input name="n1" type="password" minLength="6" required /></label>
        <div className="two"><button type="button" className="btn line" onClick={closeSheet}>Cancel</button><button className={'btn' + (busy ? ' loading' : '')}>Update</button></div>
      </form>
    </>
  );
}

export default function Sheet({ name, ...props }) {
  const C = { help: Help, filter: Filter, review: Review, profile: Profile, passwd: Passwd }[name];
  return C ? <C {...props} /> : null;
}
