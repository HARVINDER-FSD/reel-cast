import { useState } from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi, bookingApi, getErrorMsg } from '../../services/api.js';
import useAuthStore from '../../store/authStore.js';
import Navbar from '../../components/shared/Navbar.jsx';
import Spinner from '../../components/shared/Spinner.jsx';
import Pagination from '../../components/shared/Pagination.jsx';

function Sidebar({ pendingCount, unverifiedCount }) {
  return (
    <div className="sidebar" style={{ width: 205, background: '#1A1A2E', flexShrink: 0 }}>
      <div style={{ padding: '1.1rem 1.3rem', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        <div style={{ width: 26, height: 26, background: 'linear-gradient(135deg,#6C63FF,#8B85FF)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className="ti ti-video" style={{ color: '#fff', fontSize: '.82rem' }} />
        </div>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>ReelCast</div>
          <div style={{ fontSize: '.58rem', color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: 1 }}>Admin Panel</div>
        </div>
      </div>

      {[
        { to: 'overview', icon: 'ti-dashboard', label: 'Dashboard' },
        { to: 'requests', icon: 'ti-send', label: 'All Requests', badge: pendingCount, badgeColor: '#FF4757' },
        { to: 'talent', icon: 'ti-users', label: 'Talent', badge: unverifiedCount, badgeColor: '#00C896' },
        { to: 'ig-pages', icon: 'ti-brand-instagram', label: 'IG Pages', ig: true },
        { to: 'brands', icon: 'ti-building-store', label: 'Brands' },
        { to: 'users', icon: 'ti-user-circle', label: 'All Users' },
      ].map(l => (
        <NavLink key={l.to} to={l.to}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.58rem 1.2rem',
            color: isActive ? '#fff' : 'rgba(255,255,255,.45)',
            cursor: 'pointer', fontSize: '.83rem', fontWeight: isActive ? 600 : 500,
            borderLeft: isActive ? `3px solid ${l.ig ? '#E1306C' : '#6C63FF'}` : '3px solid transparent',
            background: isActive ? (l.ig ? 'rgba(225,48,108,.18)' : 'rgba(108,99,255,.18)') : 'transparent',
            textDecoration: 'none', transition: 'all .15s',
          })}>
          <i className={`ti ${l.icon}`} />
          <span style={{ flex: 1 }}>{l.label}</span>
          {l.badge > 0 && (
            <span style={{ fontSize: '.6rem', fontWeight: 700, padding: '.1rem .45rem', borderRadius: 20, background: l.badgeColor, color: '#fff' }}>
              {l.badge}
            </span>
          )}
        </NavLink>
      ))}

      <div style={{ marginTop: 'auto', marginBottom: '1rem' }}>
        <NavLink to="/" onClick={async () => { await useAuthStore.getState().logout(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.58rem 1.2rem', color: 'rgba(255,255,255,.45)', cursor: 'pointer', fontSize: '.83rem', textDecoration: 'none' }}>
          <i className="ti ti-logout" /> Sign Out
        </NavLink>
      </div>
    </div>
  );
}

function Overview({ stats }) {
  const { overview, growth } = stats || {};
  return (
    <div>
      <div className="d-title">Dashboard</div>
      <div className="d-sub">Platform overview</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.4rem' }}>
        {[
          { l: 'Total Talent',    v: overview?.totalTalent,         s: `+${growth?.newUsersThisWeek || 0} this week` },
          { l: 'Instagram Pages', v: overview?.totalInstagramPages, s: 'Listed pages', c: 'ig' },
          { l: 'Pending Requests', v: overview?.pendingBookings,    s: 'Needs action', c: 'warn' },
          { l: 'Est. Revenue',    v: `₹${(overview?.estimatedRevenue || 0).toLocaleString()}`, s: 'Completed deals' },
        ].map(k => (
          <div key={k.l} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E8F0', padding: '1rem 1.2rem' }}>
            <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#8888AA', marginBottom: '.3rem' }}>{k.l}</div>
            <div style={{ fontSize: '1.55rem', fontWeight: 800, letterSpacing: -.5 }}>{k.v}</div>
            <div className={`kpi-sub ${k.c || 'green'}`}>{k.s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AllRequests() {
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', statusFilter, typeFilter, page],
    queryFn: () => adminApi.getBookings({ status: statusFilter, bookingType: typeFilter, page, limit: 30 }),
    keepPreviousData: true,
  });

  const bookings = data?.data?.data?.bookings || [];
  const pag      = data?.data?.data?.pagination || {};

  const approveMut = useMutation({
    mutationFn: (id) => bookingApi.approve(id, {}),
    onSuccess: () => { toast.success('Booking approved! Contact revealed to brand.'); qc.invalidateQueries(['admin-bookings']); },
    onError: (e) => toast.error(getErrorMsg(e)),
  });

  const rejectMut = useMutation({
    mutationFn: (id) => bookingApi.reject(id, { rejectionReason: 'Does not meet requirements' }),
    onSuccess: () => { toast.success('Booking rejected.'); qc.invalidateQueries(['admin-bookings']); },
    onError: (e) => toast.error(getErrorMsg(e)),
  });

  return (
    <div>
      <div className="d-title">All Requests</div>
      <div className="d-sub">Approve → contact revealed to brand. Reject → request closed.</div>
      <div style={{ display: 'flex', gap: '.6rem', marginBottom: '1rem' }}>
        <select className="rc-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {['pending', 'approved', 'rejected', 'completed'].map(s => <option key={s} value={s}>{cap(s)}</option>)}
        </select>
        <select className="rc-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="talent">Talent</option>
          <option value="instagram">Instagram</option>
        </select>
      </div>

      {isLoading ? <Spinner /> : (
        <>
          <div className="tbl-card">
            <table>
              <thead>
                <tr>
                  <th>Talent / Page</th><th>Brand</th><th>Type</th><th>Date</th><th>Budget</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => {
                  const target = b.talent || b.instagramPage;
                  return (
                    <tr key={b._id}>
                      <td>
                        <strong>{target?.handle || target?.name || '—'}</strong>
                        {b.bookingType === 'instagram' && <span className="pill igp" style={{ marginLeft: 5, fontSize: '.6rem' }}>IG</span>}
                      </td>
                      <td>{b.brand?.brandName || b.brand?.name || '—'}</td>
                      <td style={{ color: '#8888AA', fontSize: '.76rem' }}>{b.projectType || b.promoType || '—'}</td>
                      <td style={{ color: '#8888AA', fontSize: '.76rem' }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontWeight: 600, color: '#6C63FF' }}>₹{b.budget?.toLocaleString() || '—'}</td>
                      <td><span className={`pill ${b.status}`}>{cap(b.status)}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {b.status === 'pending' && (
                            <>
                              <button className="btn-rc success sm" onClick={() => approveMut.mutate(b._id)}>
                                <i className="ti ti-check" />
                              </button>
                              <button className="btn-rc danger sm" onClick={() => rejectMut.mutate(b._id)}>
                                <i className="ti ti-x" />
                              </button>
                            </>
                          )}
                          {b.status !== 'pending' && (
                            <span style={{ fontSize: '.75rem', color: '#8888AA' }}>{cap(b.status)}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {bookings.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#8888AA' }}>No requests found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={pag.page} pages={pag.pages} onPage={setPage} />
        </>
      )}
    </div>
  );
}

function UserList({ role: roleFilter, title }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter, page, search],
    queryFn: () => adminApi.getUsers({ role: roleFilter, page, limit: 30, search }),
    keepPreviousData: true,
  });

  const users = data?.data?.data?.users || [];
  const pag   = data?.data?.data?.pagination || {};

  const verifyMut = useMutation({
    mutationFn: (id) => adminApi.verifyUser(id),
    onSuccess: () => { toast.success('User verified!'); qc.invalidateQueries(['admin-users']); },
    onError: (e) => toast.error(getErrorMsg(e)),
  });

  const deactivateMut = useMutation({
    mutationFn: (id) => adminApi.deactivate(id),
    onSuccess: () => { toast.success('User deactivated.'); qc.invalidateQueries(['admin-users']); },
    onError: (e) => toast.error(getErrorMsg(e)),
  });

  return (
    <div>
      <div className="d-title">{title}</div>
      <div style={{ marginBottom: '1rem' }}>
        <div className="search-wrap" style={{ maxWidth: 300 }}>
          <i className="ti ti-search" />
          <input placeholder="Search by name or email…" onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {isLoading ? <Spinner /> : (
        <>
          <div className="tbl-card">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th>
                  {roleFilter === 'talent' && <><th>Category</th><th>City</th><th>Rate</th></>}
                  {roleFilter === 'igpage' && <><th>Handle</th><th>Niche</th><th>Followers</th></>}
                  {roleFilter === 'brand' && <><th>Brand Name</th><th>Plan</th></>}
                  <th>Verified</th><th>Joined</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td style={{ color: '#8888AA', fontSize: '.78rem' }}>{u.email}</td>
                    {roleFilter === 'talent' && (
                      <>
                        <td><span className="pill" style={{ background: '#EEEDFF', color: '#6C63FF' }}>{u.category}</span></td>
                        <td>{u.city}</td>
                        <td style={{ fontWeight: 600, color: '#6C63FF' }}>₹{u.rate?.toLocaleString()}</td>
                      </>
                    )}
                    {roleFilter === 'igpage' && (
                      <>
                        <td style={{ color: '#E1306C' }}>{u.handle}</td>
                        <td style={{ fontSize: '.78rem' }}>{u.niche}</td>
                        <td style={{ fontWeight: 600 }}>{u.followers}</td>
                      </>
                    )}
                    {roleFilter === 'brand' && (
                      <>
                        <td><strong>{u.brandName}</strong></td>
                        <td><span className="pill approved">{cap(u.plan)}</span></td>
                      </>
                    )}
                    <td><span className={`pill ${u.isVerified ? 'verified' : 'pending'}`}>{u.isVerified ? 'Verified' : 'Pending'}</span></td>
                    <td style={{ color: '#8888AA', fontSize: '.76rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {!u.isVerified && (roleFilter === 'talent' || roleFilter === 'igpage') && (
                          <button className="btn-rc success sm" onClick={() => verifyMut.mutate(u._id)} title="Verify">
                            <i className="ti ti-shield-check" />
                          </button>
                        )}
                        {u.isActive && (
                          <button className="btn-rc ghost sm" onClick={() => deactivateMut.mutate(u._id)} title="Deactivate">
                            <i className="ti ti-ban" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#8888AA' }}>No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={pag.page} pages={pag.pages} onPage={setPage} />
        </>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuthStore();

  const { data: dashData } = useQuery({ queryKey: ['admin-dash'], queryFn: adminApi.getDashboard });
  const { data: statsData } = useQuery({ queryKey: ['admin-stats'], queryFn: adminApi.getStats });

  const dash  = dashData?.data?.data;
  const stats = statsData?.data?.data;

  const pendingCount = dash?.pendingActions?.pendingBookings || 0;
  const unverifiedCount = (dash?.pendingActions?.unverifiedTalent || 0) + (dash?.pendingActions?.unverifiedPages || 0);

  if (!user) return <Spinner fullScreen />;

  return (
    <div>
      <Navbar />
      <div className="dash-layout">
        <Sidebar pendingCount={pendingCount} unverifiedCount={unverifiedCount} />
        <div className="dash-main">
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview stats={stats} />} />
            <Route path="requests" element={<AllRequests />} />
            <Route path="talent"   element={<UserList roleFilter="talent"  title="Talent Management" />} />
            <Route path="ig-pages" element={<UserList roleFilter="igpage"  title="Instagram Pages" />} />
            <Route path="brands"   element={<UserList roleFilter="brand"   title="Brand Management" />} />
            <Route path="users"    element={<UserList roleFilter=""        title="All Users" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
