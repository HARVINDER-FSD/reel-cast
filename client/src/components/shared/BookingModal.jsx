import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bookingApi, getErrorMsg } from '../../services/api.js';

export function TalentBookingModal({ talent, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ projectType: 'Reels / Short Video', message: '', shootDate: '', budget: talent?.rate || '' });

  const mutation = useMutation({
    mutationFn: (data) => bookingApi.createTalent(data),
    onSuccess: () => {
      toast.success(`Booking request sent for ${talent.name}!`);
      qc.invalidateQueries(['bookings']);
      onClose();
    },
    onError: (err) => toast.error(getErrorMsg(err)),
  });

  const submit = (e) => {
    e.preventDefault();
    mutation.mutate({ talentId: talent._id, ...form });
  };

  return (
    <div className="rc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rc-modal">
        <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>{talent.emoji || '👤'}</div>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '.2rem' }}>Book {talent.name}</h2>
        <p style={{ fontSize: '.8rem', color: '#8888AA', marginBottom: '1rem' }}>
          {talent.city} · {talent.category} · ₹{talent.rate?.toLocaleString()}/project
        </p>
        <div style={{ background: '#FFF9F0', border: '1px solid #FFE0A0', borderRadius: 9, padding: '.7rem .9rem', fontSize: '.78rem', color: '#8A5700', marginBottom: '.9rem', display: 'flex', gap: '.45rem' }}>
          <i className="ti ti-lock" style={{ flexShrink: 0, marginTop: 1 }} />
          Contact details are hidden and will only be shared after ReelCast admin approves your request.
        </div>
        <form onSubmit={submit}>
          <div className="rc-field">
            <label>Project Type</label>
            <select className="rc-field" value={form.projectType} onChange={e => setForm({ ...form, projectType: e.target.value })}
              style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none' }}>
              {['Reels / Short Video', 'Fashion Shoot', 'Product Commercial', 'UGC Content', 'Corporate', 'Event Coverage', 'Other'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="rc-field">
            <label>Shoot Date (optional)</label>
            <input type="date" value={form.shootDate} onChange={e => setForm({ ...form, shootDate: e.target.value })}
              style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none' }} />
          </div>
          <div className="rc-field">
            <label>Project Description *</label>
            <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Describe your project — product, tone, location, duration..."
              style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none', resize: 'vertical', minHeight: 80 }} />
          </div>
          <div style={{ display: 'flex', gap: '.6rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn-rc ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn-rc primary" style={{ flex: 1, justifyContent: 'center' }} disabled={mutation.isPending}>
              {mutation.isPending ? 'Sending…' : <><i className="ti ti-send" /> Send Request</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function IGBookingModal({ page, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ promoType: 'Feed Post', campaignName: '', goLiveDate: '', message: '', budget: page?.postRate || '' });

  const mutation = useMutation({
    mutationFn: (data) => bookingApi.createInstagram(data),
    onSuccess: () => {
      toast.success(`Promo request sent to ${page.handle}!`);
      qc.invalidateQueries(['bookings']);
      onClose();
    },
    onError: (err) => toast.error(getErrorMsg(err)),
  });

  const submit = (e) => {
    e.preventDefault();
    mutation.mutate({ instagramPageId: page._id, ...form });
  };

  return (
    <div className="rc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rc-modal ig-modal">
        <button className="modal-close" onClick={onClose}><i className="ti ti-x" /></button>
        <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>{page.emoji || '📸'}</div>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '.2rem' }}>Book Promo on {page.handle}</h2>
        <p style={{ fontSize: '.8rem', color: '#8888AA', marginBottom: '1rem' }}>
          {page.niche} · {page.followers} followers · {page.engagementRate} eng
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.5rem', marginBottom: '.9rem' }}>
          {[{ v: `₹${page.postRate?.toLocaleString()}`, l: 'Feed Post' }, { v: `₹${page.storyRate?.toLocaleString()}`, l: 'Story' }, { v: `₹${page.reelRate?.toLocaleString()}`, l: 'Reel' }].map(r => (
            <div key={r.l} style={{ background: '#FDEDF3', borderRadius: 9, padding: '.7rem', textAlign: 'center' }}>
              <div style={{ fontSize: '.95rem', fontWeight: 800, color: '#E1306C' }}>{r.v}</div>
              <div style={{ fontSize: '.65rem', color: '#E1306C', opacity: .75, marginTop: '.1rem' }}>{r.l}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#FDEDF3', border: '1px solid #F5A8C0', borderRadius: 9, padding: '.7rem .9rem', fontSize: '.78rem', color: '#8B1A3C', marginBottom: '.9rem', display: 'flex', gap: '.45rem' }}>
          <i className="ti ti-lock" style={{ flexShrink: 0, marginTop: 1 }} />
          Page owner's contact is hidden — revealed only after admin approval.
        </div>
        <form onSubmit={submit}>
          <div className="rc-field">
            <label>Promotion Type</label>
            <select value={form.promoType} onChange={e => setForm({ ...form, promoType: e.target.value })}
              style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none' }}>
              {['Feed Post', 'Instagram Story', 'Reel', 'Story + Reel Combo', 'Series (3 stories)', 'IGTV', 'Carousel Post'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="rc-field">
            <label>Brand / Campaign Name</label>
            <input type="text" value={form.campaignName} onChange={e => setForm({ ...form, campaignName: e.target.value })}
              placeholder="Your brand or product name"
              style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none' }} />
          </div>
          <div className="rc-field">
            <label>Go Live Date (optional)</label>
            <input type="date" value={form.goLiveDate} onChange={e => setForm({ ...form, goLiveDate: e.target.value })}
              style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none' }} />
          </div>
          <div className="rc-field">
            <label>Brief / Requirements *</label>
            <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Product details, caption style, hashtags, dos & don'ts..."
              style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none', resize: 'vertical', minHeight: 80 }} />
          </div>
          <div style={{ display: 'flex', gap: '.6rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn-rc ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn-rc ig" style={{ flex: 1, justifyContent: 'center' }} disabled={mutation.isPending}>
              {mutation.isPending ? 'Sending…' : <><i className="ti ti-brand-instagram" /> Send Request</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
