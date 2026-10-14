import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { talentApi, igApi } from '../services/api.js';
import Navbar from '../components/shared/Navbar.jsx';

const CATEGORIES = [
  { name: 'Models', icon: 'ti-camera', color: '#EEEDFF', ic: '#6C63FF', cat: 'Model', count: '480+' },
  { name: 'Influencers', icon: 'ti-star', color: '#FFF0E8', ic: '#E1306C', cat: 'Influencer', count: '310+' },
  { name: 'UGC Creators', icon: 'ti-device-mobile-message', color: '#E0FBF4', ic: '#00C896', cat: 'UGC Creator', count: '290+' },
  { name: 'Child Artists', icon: 'ti-baby-carriage', color: '#FFF4E0', ic: '#F5A623', cat: 'Child Artist', count: '120+' },
  { name: 'Photographers', icon: 'ti-aperture', color: '#F0EFFF', ic: '#9B8FFF', cat: 'Photographer', count: '215+' },
  { name: 'Videographers', icon: 'ti-movie', color: '#FFEEF5', ic: '#FF4D8D', cat: 'Videographer', count: '180+' },
  { name: 'Fitness & Sports', icon: 'ti-barbell', color: '#F0F8FF', ic: '#3A8FFF', cat: 'Fitness & Sports', count: '140+' },
  { name: 'Fashion & Styling', icon: 'ti-hanger', color: '#FFF0FB', ic: '#CC44BB', cat: 'Fashion & Styling', count: '200+' },
];

const PLANS = [
  { name: 'Starter', price: '₹2,999', period: '/mo', desc: 'Small teams & boutique agencies', featured: false, features: ['50 talent + page profiles', '5 booking/promo requests', 'All 12 categories + IG pages', 'Email support'] },
  { name: 'Growth', price: '₹5,999', period: '/mo', desc: 'Growing agencies & active brands', featured: true, features: ['Unlimited browsing', '20 requests/month', 'Priority admin processing', 'Account manager', 'Instagram page analytics'] },
  { name: 'Pro', price: '₹9,999', period: '/mo', desc: 'High-volume & production houses', featured: false, features: ['Everything in Growth', 'Unlimited requests', 'WhatsApp support', 'Early access to new pages', 'Custom sourcing'] },
];

function TalentCard({ item, onBook }) {
  const isIG = item.type === 'ig';
  return (
    <div className={`tc ${isIG ? 'ig-card' : ''}`} onClick={() => onBook(item)}>
      <div className="tc-top" style={{ background: isIG ? 'linear-gradient(135deg,#FDEDF3,#FFF3EE)' : 'linear-gradient(135deg,#EEEDFF,#E8F8F0)' }}>
        <span style={{ fontSize: '2.8rem' }}>{item.emoji || (isIG ? '📸' : '👤')}</span>
        <span className={`tc-avail ${item.availability === 'available' ? 'yes' : 'no'}`}>
          {item.availability === 'available' ? 'Available' : 'Busy'}
        </span>
        <span className={`tc-cat ${isIG ? 'ig' : ''}`}>{isIG ? 'Instagram Page' : item.category}</span>
      </div>
      <div className="tc-body">
        <div className="tc-name">{item.handle || item.name}</div>
        <div className="tc-meta">{item.city}{isIG ? ` · ${item.niche}` : ''}</div>
        {isIG && (
          <div className="tc-stats">
            <span className="tc-stat followers"><i className="ti ti-brand-instagram" style={{ fontSize: 8 }} /> {item.followers}</span>
            <span className="tc-stat eng">{item.engagementRate} eng</span>
          </div>
        )}
        <span className={`tc-rate ${isIG ? 'ig' : ''}`}>
          ₹{(isIG ? item.postRate : item.rate)?.toLocaleString()}/{isIG ? 'post' : 'project'}
        </span>
        <div className="tc-lock"><i className="ti ti-lock" style={{ fontSize: 9 }} /> Subscribe to contact</div>
        <Link to="/register?role=brand" className={`btn-rc ${isIG ? 'ig' : 'primary'} w-100 mt-2`}
          style={{ width: '100%', justifyContent: 'center', padding: '.48rem' }}
          onClick={e => e.stopPropagation()}>
          {isIG ? <><i className="ti ti-brand-instagram" /> Book Promo</> : <><i className="ti ti-send" /> Request Booking</>}
        </Link>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showResults, setShowResults] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const searchRef = useRef(null);

  const { data: talentData } = useQuery({ queryKey: ['landing-talent'], queryFn: () => talentApi.getAll({ limit: 6 }) });
  const { data: igData }     = useQuery({ queryKey: ['landing-ig'],     queryFn: () => igApi.getAll({ limit: 4 }) });

  const talents  = talentData?.data?.data?.talents  || [];
  const igPages  = igData?.data?.data?.instagramPages || [];
  const combined = [...talents.map(t => ({ ...t, type: 'talent' })), ...igPages.map(p => ({ ...p, type: 'ig' }))];

  // Build search data from API results
  useEffect(() => {
    setSearchData(combined);
  }, [talentData, igData]);

  const filteredResults = searchData.filter(item => {
    const hay = `${item.name || ''} ${item.handle || ''} ${item.category || ''} ${item.niche || ''} ${item.city || ''}`.toLowerCase();
    const matchQ = !searchQ || hay.includes(searchQ.toLowerCase());
    const matchF = activeFilter === 'all' || item.category === activeFilter || (activeFilter === 'Instagram Page' && item.type === 'ig');
    return matchQ && matchF;
  });

  const handleSearch = () => {
    if (searchQ || activeFilter !== 'all') setShowResults(true);
  };

  const clearSearch = () => {
    setSearchQ(''); setActiveFilter('all'); setShowResults(false);
    if (searchRef.current) searchRef.current.value = '';
  };

  return (
    <div>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        padding: '5.5rem 5% 4.5rem',
        background: 'linear-gradient(155deg,#0D0D1A,#1A1A3E 55%,#0D1A2E)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-30%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(108,99,255,.15),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(0,200,150,.1),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'rgba(108,99,255,.15)', border: '1px solid rgba(108,99,255,.3)', color: '#A09EFF', fontSize: '.74rem', fontWeight: 600, padding: '.38rem .95rem', borderRadius: 20, marginBottom: '1.3rem', letterSpacing: '.5px', textTransform: 'uppercase' }}>
          <i className="ti ti-sparkles" /> India's #1 Creator, Model & Instagram Page Marketplace
        </div>
        <h1 style={{ fontSize: 'clamp(1.9rem,5vw,3.4rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: '1.1rem', letterSpacing: -1 }}>
          Book Talent.{' '}
          <span style={{ background: 'linear-gradient(90deg,#A09EFF,#00C896)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Promote on Pages.</span>
          <br />Grow Your Brand.
        </h1>
        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,.55)', maxWidth: 560, margin: '0 auto 2.2rem', lineHeight: 1.7 }}>
          Connect with verified models, creators, influencers & Instagram page owners — all under one roof. Fully managed. Contact revealed only after approval.
        </p>
        <div style={{ display: 'flex', gap: '.8rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <Link to="/register?role=brand" style={{ padding: '.75rem 1.8rem', borderRadius: 10, fontSize: '.92rem', fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'Inter', background: 'linear-gradient(135deg,#6C63FF,#8B85FF)', color: '#fff', boxShadow: '0 4px 18px rgba(108,99,255,.4)', display: 'inline-flex', alignItems: 'center', gap: '.45rem', textDecoration: 'none', transition: 'all .2s' }}>
            <i className="ti ti-building-store" /> I'm a Brand / Agency
          </Link>
          <Link to="/register?role=igpage" style={{ padding: '.75rem 1.8rem', borderRadius: 10, fontSize: '.92rem', fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'Inter', background: 'linear-gradient(135deg,#E1306C,#F77737)', color: '#fff', boxShadow: '0 4px 18px rgba(225,48,108,.35)', display: 'inline-flex', alignItems: 'center', gap: '.45rem', textDecoration: 'none' }}>
            <i className="ti ti-brand-instagram" /> List My Instagram Page
          </Link>
          <Link to="/register?role=talent" style={{ padding: '.75rem 1.8rem', borderRadius: 10, fontSize: '.92rem', fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'Inter', background: 'rgba(255,255,255,.08)', color: '#fff', border: '1.5px solid rgba(255,255,255,.2)', display: 'inline-flex', alignItems: 'center', gap: '.45rem', textDecoration: 'none' }}>
            <i className="ti ti-user-plus" /> Join as Talent
          </Link>
        </div>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '1px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, overflow: 'hidden', maxWidth: 780, margin: '0 auto' }}>
          {[['2,400+', 'Verified Talent'], ['480+', 'Instagram Pages'], ['340+', 'Brands & Agencies'], ['12+', 'Categories'], ['₹999', 'Starting Rate']].map(([n, l]) => (
            <div key={l} style={{ padding: '1.3rem 1rem', background: 'rgba(255,255,255,.04)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: -.5 }}>{n}</div>
              <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.4)', marginTop: '.15rem', fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEARCH ── */}
      <section style={{ background: '#fff', padding: '2.5rem 5% 1.5rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
            <span className="sec-tag">Search Talent & Pages</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: -.4 }}>Find Exactly Who You Need</h2>
            <p style={{ fontSize: '.88rem', color: '#8888AA' }}>Search by name, category, city or keyword</p>
          </div>
          <div style={{ display: 'flex', gap: '.6rem', marginBottom: '1rem' }}>
            <div className="search-wrap" style={{ flex: 1 }}>
              <i className="ti ti-search" />
              <input
                ref={searchRef}
                placeholder="Search models, UGC creators, @pages, cities..."
                onChange={e => { setSearchQ(e.target.value); if (e.target.value) setShowResults(true); }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              {searchQ && <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8888AA' }}><i className="ti ti-x" /></button>}
            </div>
            <button onClick={handleSearch} className="btn-rc primary" style={{ borderRadius: 12, padding: '.7rem 1.5rem', whiteSpace: 'nowrap' }}>
              <i className="ti ti-search" /> Search
            </button>
          </div>
          {/* Quick chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', justifyContent: 'center' }}>
            {[['all', 'All', 'ti-layout-grid'], ['Model', 'Models', 'ti-camera'], ['Influencer', 'Influencers', 'ti-star'], ['UGC Creator', 'UGC Creators', 'ti-device-mobile-message'], ['Instagram Page', 'IG Pages', 'ti-brand-instagram'], ['Photographer', 'Photographers', 'ti-aperture'], ['Fitness & Sports', 'Fitness', 'ti-barbell']].map(([val, label, icon]) => (
              <button key={val}
                className={`qchip ${activeFilter === val ? (val === 'Instagram Page' ? 'ig-on' : 'on') : ''}`}
                onClick={() => { setActiveFilter(val); if (val !== 'all' || searchQ) setShowResults(true); else setShowResults(false); }}>
                <i className={`ti ${icon}`} /> {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEARCH RESULTS ── */}
      {showResults && (
        <div style={{ padding: '1rem 5% 2rem', background: '#F7F7FF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <div>
              <span style={{ fontSize: '.95rem', fontWeight: 700 }}>
                {searchQ ? `Results for "${searchQ}"` : activeFilter !== 'all' ? `Category: ${activeFilter}` : 'All Talent & Pages'}
              </span>
              <span style={{ fontSize: '.82rem', color: '#8888AA', marginLeft: '.5rem' }}>{filteredResults.length} found</span>
            </div>
            <button onClick={clearSearch} className="btn-rc ghost sm"><i className="ti ti-x" /> Clear</button>
          </div>
          {filteredResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.5rem' }}>🔍<br /><span style={{ fontSize: '1rem', fontWeight: 700 }}>No results found</span></div>
          ) : (
            <div className="mgrid">
              {filteredResults.map(item => <TalentCard key={item._id} item={item} onBook={() => navigate('/register?role=brand')} />)}
            </div>
          )}
        </div>
      )}

      {/* ── CATEGORIES ── */}
      <section id="categories" style={{ background: '#fff', padding: '3.5rem 5%' }}>
        <div className="sec-hd">
          <span className="sec-tag">Browse by Category</span>
          <h2>Every Type of Creator — One Platform</h2>
          <p>From models to Instagram page owners — find exactly who your campaign needs</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '.9rem' }}>
          {CATEGORIES.map(c => (
            <Link to={`/register?role=brand`} key={c.name}
              style={{ borderRadius: 13, border: '1.5px solid #E8E8F0', padding: '1.3rem 1rem', textAlign: 'center', cursor: 'pointer', transition: 'all .2s', background: '#fff', textDecoration: 'none', display: 'block' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#6C63FF'; e.currentTarget.style.background = '#EEEDFF'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#E8E8F0'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = ''; }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .65rem', background: c.color }}>
                <i className={`ti ${c.icon}`} style={{ color: c.ic, fontSize: '1.3rem' }} />
              </div>
              <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#0D0D1A' }}>{c.name}</div>
              <div style={{ fontSize: '.7rem', color: '#8888AA', marginTop: '.15rem' }}>{c.count} profiles</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ background: '#F7F7FF', padding: '3.5rem 5%' }}>
        <div className="sec-hd">
          <span className="sec-tag">The Process</span>
          <h2>How ReelCast Works</h2>
          <p>Fully managed — contact revealed only after admin approval</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.3rem' }}>
          {[
            { n: '01', title: 'Talent & Pages Register', desc: 'Models, creators & Instagram page owners create free profiles with rates & stats.', grad: 'linear-gradient(135deg,#6C63FF,#8B85FF)' },
            { n: '02', title: 'Brands Subscribe', desc: 'Pick a monthly plan and unlock the full talent & Instagram page catalog.', grad: 'linear-gradient(135deg,#6C63FF,#8B85FF)' },
            { n: '03', title: 'Browse & Request', desc: 'Filter profiles. Send booking or promo requests — contact stays hidden always.', grad: 'linear-gradient(135deg,#6C63FF,#8B85FF)' },
            { n: '04', title: 'Admin Approves', desc: 'ReelCast reviews & approves. Contact revealed only then. Zero bypass possible.', grad: 'linear-gradient(135deg,#00C896,#00A87A)' },
          ].map(s => (
            <div key={s.n} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8E8F0', padding: '1.6rem 1.2rem', textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: s.grad, color: '#fff', fontWeight: 800, fontSize: '.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .8rem' }}>{s.n}</div>
              <h3 style={{ fontSize: '.92rem', fontWeight: 700, marginBottom: '.4rem' }}>{s.title}</h3>
              <p style={{ fontSize: '.8rem', color: '#8888AA', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TALENT PREVIEW ── */}
      <section id="talent" style={{ background: '#fff', padding: '3.5rem 5%' }}>
        <div className="sec-hd">
          <span className="sec-tag">Featured</span>
          <h2>Talent & Instagram Pages</h2>
          <p>Subscribe to unlock full profiles, stats & contact details</p>
        </div>
        <div className="talent-grid">
          {combined.slice(0, 6).map(item => (
            <TalentCard key={item._id} item={item} onBook={() => navigate('/register?role=brand')} />
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ background: '#F7F7FF', padding: '3.5rem 5%' }}>
        <div className="sec-hd">
          <span className="sec-tag">Pricing</span>
          <h2>Simple Brand Plans</h2>
          <p>One subscription — access all talent AND Instagram pages</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.3rem', maxWidth: 860, margin: '0 auto' }}>
          {PLANS.map(p => (
            <div key={p.name} style={{ borderRadius: 16, border: p.featured ? '2px solid #6C63FF' : '1.5px solid #E8E8F0', padding: '1.8rem', position: 'relative', background: p.featured ? 'linear-gradient(160deg,#F9F8FF,#FDFCFF)' : '#fff' }}>
              {p.featured && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#6C63FF,#8B85FF)', color: '#fff', fontSize: '.7rem', fontWeight: 700, padding: '.22rem .9rem', borderRadius: 20, whiteSpace: 'nowrap' }}>✦ Most Popular</div>}
              <div style={{ fontSize: '.73rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#8888AA', marginBottom: '.35rem' }}>{p.name}</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: -1, marginBottom: '.18rem' }}>{p.price}<span style={{ fontSize: '.88rem', fontWeight: 400, color: '#8888AA' }}>{p.period}</span></div>
              <div style={{ fontSize: '.8rem', color: '#8888AA', marginBottom: '1.3rem', paddingBottom: '1.3rem', borderBottom: '1px solid #E8E8F0' }}>{p.desc}</div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '1.4rem' }}>
                {p.features.map(f => <li key={f} style={{ fontSize: '.82rem', color: '#3D3D5C', display: 'flex', alignItems: 'flex-start', gap: '.5rem' }}><i className="ti ti-check" style={{ color: '#00C896', marginTop: 2 }} />{f}</li>)}
              </ul>
              <Link to={`/register?role=brand&plan=${p.name.toLowerCase()}`}
                style={{ display: 'block', width: '100%', padding: '.65rem', borderRadius: 9, fontSize: '.88rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none', border: p.featured ? 'none' : '1.5px solid #6C63FF', background: p.featured ? 'linear-gradient(135deg,#6C63FF,#8B85FF)' : '#fff', color: p.featured ? '#fff' : '#6C63FF' }}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '4.5rem 5%', background: 'linear-gradient(135deg,#0D0D1A,#1A1A3E)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: -.5, marginBottom: '.8rem' }}>Ready to Scale Your Campaigns?</h2>
        <p style={{ color: 'rgba(255,255,255,.5)', maxWidth: 420, margin: '0 auto 1.8rem', fontSize: '.9rem' }}>Join 340+ brands using ReelCast to find perfect talent and Instagram pages.</p>
        <div style={{ display: 'flex', gap: '.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register?role=brand" style={{ padding: '.78rem 1.9rem', borderRadius: 10, fontSize: '.92rem', fontWeight: 700, background: '#fff', color: '#4B44CC', textDecoration: 'none' }}>Browse Talent →</Link>
          <Link to="/register?role=igpage" style={{ padding: '.78rem 1.9rem', borderRadius: 10, fontSize: '.92rem', fontWeight: 700, background: 'linear-gradient(135deg,#E1306C,#F77737)', color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
            <i className="ti ti-brand-instagram" /> List My Page
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#07070F', color: 'rgba(255,255,255,.3)', textAlign: 'center', padding: '1.8rem 5%', fontSize: '.8rem' }}>
        © 2025 <strong style={{ color: 'rgba(255,255,255,.6)' }}>ReelCast</strong> · India's Creator, Model & Instagram Page Marketplace
      </footer>
    </div>
  );
}
