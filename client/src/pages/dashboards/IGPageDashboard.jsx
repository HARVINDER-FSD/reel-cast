import { useState } from 'react';
import { NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { igApi, bookingApi, getErrorMsg } from '../../services/api.js';
import useAuthStore from '../../store/authStore.js';
import Navbar from '../../components/shared/Navbar.jsx';
import Spinner from '../../components/shared/Spinner.jsx';
import BookingsTable from '../../components/shared/BookingsTable.jsx';

function Sidebar() {
  const navigate = useNavigate();
  const links = [
    { to: 'overview', icon: 'ti-brand-instagram', label: 'Overview',       ig: true },
    { to: 'profile',  icon: 'ti-id-badge',         label: 'My Page Profile', ig: true },
    { to: 'requests', icon: 'ti-calendar-event',   label: 'Promo Requests',  ig: true },
  ];
  return (
    <div className="sidebar">
      <div className="sb-sec">Instagram Page</div>
      {links.map(l => (
        <NavLink key={l.to} to={l.to} className={({ isActive }) => `si${l.ig ? ' ig-si' : ''}${isActive ? ' active' : ''}`}>
          <i className={`ti ${l.icon}`} /> {l.label}
        </NavLink>
      ))}
      <div className="si-bot">
        <button className="si"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
          onClick={async () => { await useAuthStore.getState().logout(); navigate('/'); }}>
          <i className="ti ti-logout" /> Sign Out
        </button>
      </div>
    </div>
  );
}

function Overview({ user, bookings }) {
  const pending = bookings.filter(b => b.status === 'pending').length;
  const approved = bookings.filter(b => b.status === 'approved').length;

  return (
    <div>
      <div className="d-title">Welcome, {user?.handle || user?.name?.split(' ')[0]} 👋</div>
      <div className="d-sub">Your Instagram page is listed — brands are discovering you!</div>
      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-box"><div className="kpi-lbl">Promo Requests</div><div className="kpi-val">{bookings.length}</div></div>
        <div className="kpi-box"><div className="kpi-lbl">Pending</div><div className="kpi-val">{pending}</div>{pending > 0 && <div className="kpi-sub warn">Needs review</div>}</div>
        <div className="kpi-box"><div className="kpi-lbl">Approved</div><div className="kpi-val">{approved}</div><div className="kpi-sub ig">Contact shared</div></div>
        <div className="kpi-box"><div className="kpi-lbl">Followers</div><div className="kpi-val">{user?.followers || '—'}</div></div>
      </div>
      <BookingsTable bookings={bookings.slice(0, 5)} role="igpage" />
    </div>
  );
}

function Profile({ user }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    handle: user?.handle || '', niche: user?.niche || '',
    followers: user?.followers || '', engagementRate: user?.engagementRate || '',
    postRate: user?.postRate || '', storyRate: user?.storyRate || '', reelRate: user?.reelRate || '',
    city: user?.city || '', about: user?.about || '', availability: user?.availability || 'available',
  });

  const mutation = useMutation({
    mutationFn: (data) => igApi.update(user._id, data),
    onSuccess: () => { toast.success('Profile updated!'); setEditing(false); qc.invalidateQueries(['me']); },
    onError: (e) => toast.error(getErrorMsg(e)),
  });

  return (
    <div>
      <div className="d-title">My Instagram Page Profile</div>
      <div className="d-sub">This is what brands see when they browse your page</div>

      {/* IG Banner */}
      <div style={{ background: 'linear-gradient(135deg,#E1306C,#F77737)', borderRadius: 13, padding: '1.4rem', marginBottom: '1.2rem', color: '#fff' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '.25rem' }}>{user?.handle}</h3>
        <div style={{ fontSize: '.85rem', opacity: .8, marginBottom: '1rem' }}>{user?.niche}</div>
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
          {[['Followers', user?.followers], ['Engagement', user?.engagementRate], ['Location', user?.city]].map(([l, v]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{v || '—'}</div>
              <div style={{ fontSize: '.7rem', opacity: .7 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.8rem' }}>
          {[['Feed Post', user?.postRate], ['Story', user?.storyRate], ['Reel', user?.reelRate]].map(([l, v]) => (
            <div key={l} style={{ background: 'rgba(255,255,255,.15)', borderRadius: 9, padding: '.7rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>₹{v?.toLocaleString() || '—'}</div>
              <div style={{ fontSize: '.68rem', opacity: .75, marginTop: '.1rem' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rc-card" style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '.9rem', fontWeight: 700, margin: 0 }}>Edit Profile</h3>
          <button className="btn-rc ghost sm" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit'}</button>
        </div>
        {editing ? (
          <form onSubmit={e => { e.preventDefault(); mutation.mutate({ ...form, postRate: parseInt(form.postRate), storyRate: parseInt(form.storyRate), reelRate: parseInt(form.reelRate) }); }}>
            {[['handle', 'Handle'], ['niche', 'Niche'], ['followers', 'Followers'], ['engagementRate', 'Engagement Rate'], ['city', 'City']].map(([k, l]) => (
              <div key={k} className="rc-field"><label>{l}</label><input value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} /></div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.6rem' }}>
              <div className="rc-field"><label>Post Rate (₹)</label><input type="number" value={form.postRate} onChange={e => setForm(p => ({ ...p, postRate: e.target.value }))} /></div>
              <div className="rc-field"><label>Story Rate (₹)</label><input type="number" value={form.storyRate} onChange={e => setForm(p => ({ ...p, storyRate: e.target.value }))} /></div>
              <div className="rc-field"><label>Reel Rate (₹)</label><input type="number" value={form.reelRate} onChange={e => setForm(p => ({ ...p, reelRate: e.target.value }))} /></div>
            </div>
            <button type="submit" className="btn-rc ig" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save Changes'}</button>
          </form>
        ) : (
          <div style={{ fontSize: '.84rem', color: '#8888AA' }}>
            <div style={{ padding: '.5rem 0', borderBottom: '1px solid #E8E8F0', display: 'flex', justifyContent: 'space-between' }}><span>Phone</span><span style={{ color: '#FF4757', fontSize: '.8rem' }}><i className="ti ti-lock" /> Hidden until approval</span></div>
            <div style={{ padding: '.5rem 0', borderBottom: '1px solid #E8E8F0', display: 'flex', justifyContent: 'space-between' }}><span>Email</span><span style={{ color: '#FF4757', fontSize: '.8rem' }}><i className="ti ti-lock" /> Hidden until approval</span></div>
            <div style={{ padding: '.5rem 0', display: 'flex', justifyContent: 'space-between' }}><span>Status</span><span style={{ color: '#009970', fontWeight: 600 }}><i className="ti ti-brand-instagram" /> Page Verified</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

function Requests({ bookings }) {
  const qc = useQueryClient();
  const completeMutation = useMutation({
    mutationFn: (id) => bookingApi.complete(id),
    onSuccess: () => { toast.success('Promo marked as complete!'); qc.invalidateQueries(['bookings']); },
    onError: (e) => toast.error(getErrorMsg(e)),
  });

  return (
    <div>
      <div className="d-title">Promo Requests</div>
      <div className="d-sub">Contact only revealed after ReelCast approves</div>
      <BookingsTable bookings={bookings} role="igpage" onComplete={(id) => completeMutation.mutate(id)} />
    </div>
  );
}

export default function IGPageDashboard() {
  const { user } = useAuthStore();
  const { data: bookingData, isLoading } = useQuery({ queryKey: ['bookings'], queryFn: () => bookingApi.getAll() });
  const bookings = bookingData?.data?.data?.bookings || [];

  if (!user) return <Spinner fullScreen />;

  return (
    <div>
      <Navbar />
      <div className="dash-layout">
        <Sidebar />
        <div className="dash-main">
          {isLoading ? <Spinner /> : (
            <Routes>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<Overview user={user} bookings={bookings} />} />
              <Route path="profile"  element={<Profile user={user} />} />
              <Route path="requests" element={<Requests bookings={bookings} />} />
            </Routes>
          )}
        </div>
      </div>
    </div>
  );
}
