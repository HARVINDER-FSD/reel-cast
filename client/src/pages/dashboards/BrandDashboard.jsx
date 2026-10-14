import { useState } from 'react';
import { NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { talentApi, igApi, bookingApi, brandApi } from '../../services/api.js';
import useAuthStore from '../../store/authStore.js';
import Navbar from '../../components/shared/Navbar.jsx';
import Spinner from '../../components/shared/Spinner.jsx';
import Pagination from '../../components/shared/Pagination.jsx';
import BookingsTable from '../../components/shared/BookingsTable.jsx';
import { TalentBookingModal, IGBookingModal } from '../../components/shared/BookingModal.jsx';

function Sidebar() {
  const navigate = useNavigate();
  const links = [
    { to: 'browse',       icon: 'ti-layout-grid',     label: 'Browse Talent',   ig: false },
    { to: 'ig-pages',     icon: 'ti-brand-instagram', label: 'Instagram Pages', ig: true  },
    { to: 'bookings',     icon: 'ti-calendar-event',  label: 'My Requests',     ig: false },
    { to: 'subscription', icon: 'ti-crown',           label: 'Subscription',    ig: false },
  ];
  return (
    <div className="sidebar">
      <div className="sb-sec">Browse</div>
      {links.slice(0, 2).map(l => (
        <NavLink key={l.to} to={l.to} className={({ isActive }) => `si${l.ig ? ' ig-si' : ''}${isActive ? ' active' : ''}`}>
          <i className={`ti ${l.icon}`} /> {l.label}
        </NavLink>
      ))}
      <div className="sb-sec">Account</div>
      {links.slice(2).map(l => (
        <NavLink key={l.to} to={l.to} className={({ isActive }) => `si${isActive ? ' active' : ''}`}>
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

function BrowseTalent() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTalent, setSelectedTalent] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['talent-browse', search, category, city, page],
    queryFn: () => talentApi.getAll({ search, category, city, page, limit: 20 }),
    keepPreviousData: true,
  });

  const items = data?.data?.data?.talents || [];
  const pag   = data?.data?.data?.pagination || {};

  return (
    <div>
      <div className="d-title">Browse Talent</div>
      <div className="d-sub">Find the perfect creator for your next campaign</div>
      <div className="filter-bar">
        <div className="filter-row">
          <div className="search-wrap" style={{ flex: 1 }}>
            <i className="ti ti-search" />
            <input placeholder="Search by name or city…" onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="rc-select" onChange={e => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {['Model', 'Influencer', 'UGC Creator', 'Child Artist', 'Photographer', 'Videographer', 'Fitness & Sports', 'Fashion & Styling'].map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="rc-select" onChange={e => { setCity(e.target.value); setPage(1); }}>
            <option value="">All Cities</option>
            {['Mumbai', 'Delhi', 'Bangalore', 'Ahmedabad', 'Jaipur', 'Chennai', 'Hyderabad'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? <Spinner /> : (
        <>
          <div className="mgrid">
            {items.map(t => (
              <div key={t._id} className="tc" onClick={() => setSelectedTalent(t)}>
                <div className="tc-top" style={{ background: 'linear-gradient(135deg,#EEEDFF,#E8F8F0)' }}>
                  <span style={{ fontSize: '2.8rem' }}>{t.emoji || '👤'}</span>
                  <span className={`tc-avail ${t.availability === 'available' ? 'yes' : 'no'}`}>{t.availability === 'available' ? 'Available' : 'Busy'}</span>
                  <span className="tc-cat">{t.category}</span>
                </div>
                <div className="tc-body">
                  <div className="tc-name">{t.name}</div>
                  <div className="tc-meta">{t.city} · {t.experience}</div>
                  <span className="tc-rate">₹{t.rate?.toLocaleString()}/project</span>
                  <div className="tc-lock"><i className="ti ti-lock" style={{ fontSize: 9 }} /> Contact hidden</div>
                  <button className="btn-rc primary w-100" style={{ width: '100%', justifyContent: 'center', marginTop: '.4rem' }}>
                    <i className="ti ti-send" /> Request Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={pag.page} pages={pag.pages} onPage={setPage} />
        </>
      )}

      {selectedTalent && <TalentBookingModal talent={selectedTalent} onClose={() => setSelectedTalent(null)} />}
    </div>
  );
}

function BrowseIG() {
  const [search, setSearch] = useState('');
  const [niche, setNiche] = useState('');
  const [size, setSize] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPage, setSelectedPage] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['ig-browse', search, niche, page, size],
    queryFn: () => igApi.getAll({
      search, niche, page, limit: 20,
      ...(size === 'nano' && { minFollowers: 1000, maxFollowers: 50000 }),
      ...(size === 'micro' && { minFollowers: 50000, maxFollowers: 200000 }),
      ...(size === 'macro' && { minFollowers: 200000 }),
    }),
    keepPreviousData: true,
  });

  const items = data?.data?.data?.instagramPages || [];
  const pag   = data?.data?.data?.pagination || {};

  return (
    <div>
      <div className="d-title" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        <i className="ti ti-brand-instagram" style={{ color: '#E1306C' }} /> Instagram Pages
      </div>
      <div className="d-sub">Book a promo post, story or reel on these verified pages</div>
      <div className="filter-bar">
        <div className="filter-row">
          <div className="search-wrap" style={{ flex: 1 }}>
            <i className="ti ti-search" />
            <input placeholder="Search by handle or niche…" onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="rc-select" onChange={e => { setNiche(e.target.value); setPage(1); }}>
            <option value="">All Niches</option>
            {['Fashion & Lifestyle', 'Food & Restaurant', 'Travel & Adventure', 'Fitness & Health', 'Beauty & Makeup', 'Home Decor', 'Tech & Gadgets', 'Memes & Entertainment'].map(n => <option key={n}>{n}</option>)}
          </select>
          <select className="rc-select" onChange={e => { setSize(e.target.value); setPage(1); }}>
            <option value="">Any Size</option>
            <option value="nano">Nano (1K–50K)</option>
            <option value="micro">Micro (50K–200K)</option>
            <option value="macro">Macro (200K+)</option>
          </select>
        </div>
      </div>

      {isLoading ? <Spinner /> : (
        <>
          <div className="mgrid">
            {items.map(p => (
              <div key={p._id} className="tc ig-card" onClick={() => setSelectedPage(p)}>
                <div className="tc-top" style={{ background: 'linear-gradient(135deg,#FDEDF3,#FFF3EE)' }}>
                  <span style={{ fontSize: '2.8rem' }}>{p.emoji || '📸'}</span>
                  <span className={`tc-avail ${p.availability === 'available' ? 'yes' : 'no'}`}>{p.availability === 'available' ? 'Available' : 'Busy'}</span>
                  <span className="tc-cat ig">Instagram Page</span>
                </div>
                <div className="tc-body">
                  <div className="tc-name">{p.handle}</div>
                  <div className="tc-meta">{p.niche} · {p.city}</div>
                  <div className="tc-stats">
                    <span className="tc-stat followers"><i className="ti ti-brand-instagram" style={{ fontSize: 8 }} /> {p.followers}</span>
                    <span className="tc-stat eng">{p.engagementRate}</span>
                  </div>
                  <span className="tc-rate ig">₹{p.postRate?.toLocaleString()}/post</span>
                  <div className="tc-lock"><i className="ti ti-lock" style={{ fontSize: 9 }} /> Contact hidden</div>
                  <button className="btn-rc ig w-100" style={{ width: '100%', justifyContent: 'center', marginTop: '.4rem' }}>
                    <i className="ti ti-brand-instagram" /> Book Promo
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={pag.page} pages={pag.pages} onPage={setPage} />
        </>
      )}

      {selectedPage && <IGBookingModal page={selectedPage} onClose={() => setSelectedPage(null)} />}
    </div>
  );
}

function MyBookings() {
  const { data, isLoading } = useQuery({ queryKey: ['bookings'], queryFn: () => bookingApi.getAll() });
  const bookings = data?.data?.data?.bookings || [];
  return (
    <div>
      <div className="d-title">My Requests</div>
      <div className="d-sub">Contact revealed only for approved requests</div>
      {isLoading ? <Spinner /> : <BookingsTable bookings={bookings} role="brand" />}
    </div>
  );
}

function Subscription() {
  const { data, isLoading } = useQuery({ queryKey: ['subscription'], queryFn: brandApi.getSubscription });
  const sub = data?.data?.data?.subscription;
  if (isLoading) return <Spinner />;
  return (
    <div>
      <div className="d-title">My Subscription</div>
      <div className="rc-card" style={{ maxWidth: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '1rem' }}>
          <i className="ti ti-crown" style={{ color: '#6C63FF' }} />
          <h3 style={{ fontSize: '.9rem', fontWeight: 700, margin: 0 }}>{cap(sub?.plan)} Plan</h3>
          <span className="pill approved">{sub?.isPlanActive ? 'Active' : 'Expired'}</span>
        </div>
        {[
          ['Price', `₹${sub?.currentPlanFeatures?.price?.toLocaleString()}/month`],
          ['Requests Used', `${sub?.requestsUsed} / ${sub?.requestsLimit === -1 ? 'Unlimited' : sub?.requestsLimit}`],
          ['Requests Remaining', sub?.requestsRemaining],
          ['Plan Expires', new Date(sub?.planEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
          ['Days Remaining', `${sub?.daysRemaining} days`],
          ['Access', 'Talent + Instagram Pages ✓'],
        ].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '.5rem 0', borderBottom: '1px solid #E8E8F0', fontSize: '.84rem' }}>
            <span style={{ color: '#8888AA' }}>{l}</span>
            <span style={{ fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button className="btn-rc primary" onClick={() => toast('Upgrade to Pro — contact support@reelcast.com')}>
          <i className="ti ti-arrow-up" /> Upgrade Plan
        </button>
      </div>
    </div>
  );
}

export default function BrandDashboard() {
  const { user } = useAuthStore();
  if (!user) return <Spinner fullScreen />;

  return (
    <div>
      <Navbar />
      <div className="dash-layout">
        <Sidebar />
        <div className="dash-main">
          <Routes>
            <Route index element={<Navigate to="browse" replace />} />
            <Route path="browse"       element={<BrowseTalent />} />
            <Route path="ig-pages"     element={<BrowseIG />} />
            <Route path="bookings"     element={<MyBookings />} />
            <Route path="subscription" element={<Subscription />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
