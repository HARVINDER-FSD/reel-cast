import { useState } from 'react';
import { NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { talentApi, bookingApi, getErrorMsg } from '../../services/api.js';
import useAuthStore from '../../store/authStore.js';
import Navbar from '../../components/shared/Navbar.jsx';
import Spinner from '../../components/shared/Spinner.jsx';
import BookingsTable from '../../components/shared/BookingsTable.jsx';

function Sidebar({ user }) {
  const navigate = useNavigate();
  const links = [
    { to: 'overview',  icon: 'ti-dashboard',      label: 'Overview' },
    { to: 'profile',   icon: 'ti-user-circle',     label: 'My Profile' },
    { to: 'requests',  icon: 'ti-calendar-event',  label: 'Booking Requests' },
  ];
  return (
    <div className="sidebar">
      <div className="sb-sec">Menu</div>
      {links.map(l => (
        <NavLink key={l.to} to={l.to} className={({ isActive }) => `si${isActive ? ' active' : ''}`}>
          <i className={`ti ${l.icon}`} /> {l.label}
        </NavLink>
      ))}
      <div className="si-bot">
        <button className="si danger-si"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
          onClick={async () => { await useAuthStore.getState().logout(); navigate('/'); }}>
          <i className="ti ti-logout" /> Sign Out
        </button>
      </div>
    </div>
  );
}

function Overview({ user, bookings }) {
  const pending   = bookings.filter(b => b.status === 'pending').length;
  const approved  = bookings.filter(b => b.status === 'approved').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const recent    = bookings.slice(0, 5);

  return (
    <div>
      <div className="d-title">Welcome, {user?.name?.split(' ')[0]} 👋</div>
      <div className="d-sub">Your profile is live — brands are browsing!</div>
      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-box"><div className="kpi-lbl">Total Requests</div><div className="kpi-val">{bookings.length}</div></div>
        <div className="kpi-box"><div className="kpi-lbl">Pending</div><div className="kpi-val">{pending}</div>{pending > 0 && <div className="kpi-sub warn">{pending} awaiting</div>}</div>
        <div className="kpi-box"><div className="kpi-lbl">Approved</div><div className="kpi-val">{approved}</div><div className="kpi-sub green">Contact shared</div></div>
        <div className="kpi-box"><div className="kpi-lbl">Your Rate</div><div className="kpi-val">₹{user?.rate?.toLocaleString()}</div><div className="kpi-sub muted">Per project</div></div>
      </div>
      {recent.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, marginBottom: '.8rem', fontSize: '.92rem' }}>Recent Requests</div>
          <BookingsTable bookings={recent} role="talent" />
        </div>
      )}
    </div>
  );
}

function Profile({ user }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', city: user?.city || '',
    category: user?.category || '', rate: user?.rate || '', bio: user?.bio || '',
    availability: user?.availability || 'available',
  });

  const mutation = useMutation({
    mutationFn: (data) => talentApi.update(user._id, data),
    onSuccess: () => { toast.success('Profile updated!'); setEditing(false); qc.invalidateQueries(['me']); },
    onError: (e) => toast.error(getErrorMsg(e)),
  });

  return (
    <div>
      <div className="d-title">My Profile</div>
      <div className="d-sub">This is what brands see when browsing</div>
      <div className="rc-card" style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.4rem', margin: 0 }}>
            <i className="ti ti-user" style={{ color: '#6C63FF' }} /> Profile Details
          </h3>
          <button className="btn-rc ghost sm" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {!editing ? (
          [['Name', user?.name], ['Category', user?.category], ['City', user?.city], ['Rate', `₹${user?.rate?.toLocaleString()}/project`], ['Availability', user?.availability]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '.5rem 0', borderBottom: '1px solid #E8E8F0', fontSize: '.84rem' }}>
              <span style={{ color: '#8888AA' }}>{l}</span>
              <span style={{ fontWeight: 600 }}>{v || '—'}</span>
            </div>
          ))
        ) : (
          <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }}>
            {[['name', 'Name'], ['phone', 'Phone'], ['city', 'City'], ['rate', 'Rate (₹)'], ['bio', 'Bio']].map(([k, l]) => (
              <div key={k} className="rc-field"><label>{l}</label>
                <input value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} /></div>
            ))}
            <div className="rc-field"><label>Availability</label>
              <select value={form.availability} onChange={e => setForm(p => ({ ...p, availability: e.target.value }))} style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none' }}>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            <button type="submit" className="btn-rc primary" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save Changes'}</button>
          </form>
        )}
        <div style={{ marginTop: '1rem', background: '#E0FBF4', border: '1px solid #9FE0CB', borderRadius: 9, padding: '.7rem .9rem', fontSize: '.8rem', color: '#065040', display: 'flex', gap: '.4rem' }}>
          <i className="ti ti-lock" style={{ flexShrink: 0 }} />
          Phone & email are hidden — revealed only after admin approval of a booking request.
        </div>
      </div>
    </div>
  );
}

function Requests({ bookings, refetch }) {
  const qc = useQueryClient();
  const completeMutation = useMutation({
    mutationFn: (id) => bookingApi.complete(id),
    onSuccess: () => { toast.success('Booking marked as complete!'); qc.invalidateQueries(['bookings']); },
    onError: (e) => toast.error(getErrorMsg(e)),
  });

  return (
    <div>
      <div className="d-title">Booking Requests</div>
      <div className="d-sub">Contact revealed only after admin approval</div>
      <BookingsTable bookings={bookings} role="talent" onComplete={(id) => completeMutation.mutate(id)} />
    </div>
  );
}

export default function TalentDashboard() {
  const { user } = useAuthStore();

  const { data: bookingData, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingApi.getAll(),
  });

  const bookings = bookingData?.data?.data?.bookings || [];

  if (!user) return <Spinner fullScreen />;

  return (
    <div>
      <Navbar />
      <div className="dash-layout">
        <Sidebar user={user} />
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
