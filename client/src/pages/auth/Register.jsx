import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi, getErrorMsg } from '../../services/api.js';
import useAuthStore from '../../store/authStore.js';
import Navbar from '../../components/shared/Navbar.jsx';

const ROLES = [
  { key: 'talent', label: 'Talent', icon: 'ti-camera', color: '#6C63FF' },
  { key: 'igpage', label: 'IG Page', icon: 'ti-brand-instagram', color: '#E1306C' },
  { key: 'brand',  label: 'Brand',  icon: 'ti-building-store', color: '#00C896' },
];

const DASH = { talent: '/dashboard/talent', igpage: '/dashboard/igpage', brand: '/dashboard/brand' };

export default function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setUser = useAuthStore(s => s.setUser);
  const [role, setRole] = useState(params.get('role') || 'talent');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');

  const [base, setBase] = useState({ name: '', email: '', password: '', phone: '' });
  const [talentF, setTalentF] = useState({ city: '', gender: 'Female', category: 'Model', rate: '' });
  const [igF, setIgF] = useState({ handle: '', niche: 'Fashion & Lifestyle', followers: '', followerCount: '', engagementRate: '', postRate: '', storyRate: '', reelRate: '', city: '', about: '' });
  const [brandF, setBrandF] = useState({ brandName: '', plan: params.get('plan') || 'growth' });

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { ...base, role };
      if (role === 'talent') Object.assign(payload, talentF, { rate: parseInt(talentF.rate) });
      if (role === 'igpage') Object.assign(payload, igF, { followerCount: parseInt(igF.followerCount) || 10000, postRate: parseInt(igF.postRate), storyRate: parseInt(igF.storyRate), reelRate: parseInt(igF.reelRate) });
      if (role === 'brand') Object.assign(payload, brandF);
      const fn = { talent: authApi.registerTalent, igpage: authApi.registerIGPage, brand: authApi.registerBrand }[role];
      return fn(payload);
    },
    onSuccess: (res) => {
      const user = res.data.data.user;
      setUser(user);
      toast.success('Account created! Welcome to ReelCast 🎉');
      navigate(DASH[user.role] || '/');
    },
    onError: (e) => setErr(getErrorMsg(e)),
  });

  const submit = (e) => {
    e.preventDefault();
    setErr('');
    mutation.mutate();
  };

  const inp = (st, setter, k) => (
    <input value={st[k]} onChange={e => setter(prev => ({ ...prev, [k]: e.target.value }))}
      style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none' }} />
  );

  const sel = (st, setter, k, opts) => (
    <select value={st[k]} onChange={e => setter(prev => ({ ...prev, [k]: e.target.value }))}
      style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none', background: '#fff' }}>
      {opts.map(o => <option key={o.v || o} value={o.v || o}>{o.l || o}</option>)}
    </select>
  );

  return (
    <div>
      <Navbar />
      <div className="auth-wrap" style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>
        <div className="auth-box">
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
              <div style={{ width: 26, height: 26, background: 'linear-gradient(135deg,#6C63FF,#8B85FF)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-video" style={{ color: '#fff', fontSize: '.82rem' }} />
              </div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>Reel<span style={{ color: '#6C63FF' }}>Cast</span></span>
            </div>
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '.25rem' }}>Create Account</h2>
          <p style={{ fontSize: '.82rem', color: '#8888AA', textAlign: 'center', marginBottom: '1.2rem' }}>Join ReelCast for free</p>

          {/* Role tabs */}
          <div style={{ display: 'flex', background: '#F7F7FF', borderRadius: 10, padding: 4, marginBottom: '1.2rem', gap: 3 }}>
            {ROLES.map(r => (
              <button key={r.key} onClick={() => setRole(r.key)}
                style={{ flex: 1, padding: '.48rem', borderRadius: 7, fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter', border: 'none', transition: 'all .15s',
                  background: role === r.key ? (r.key === 'igpage' ? 'linear-gradient(135deg,#E1306C,#F77737)' : r.key === 'brand' ? 'linear-gradient(135deg,#00C896,#00A87A)' : '#fff') : 'none',
                  color: role === r.key ? (r.key === 'talent' ? '#6C63FF' : '#fff') : '#8888AA',
                  boxShadow: role === r.key ? '0 1px 6px rgba(0,0,0,.08)' : 'none',
                }}>
                <i className={`ti ${r.icon}`} /> {r.label}
              </button>
            ))}
          </div>

          {role === 'igpage' && (
            <div style={{ background: '#FDEDF3', border: '1px solid #F5A8C0', borderRadius: 9, padding: '.7rem .9rem', fontSize: '.78rem', color: '#8B1A3C', marginBottom: '.9rem', display: 'flex', gap: '.4rem', lineHeight: 1.5 }}>
              <i className="ti ti-brand-instagram" style={{ flexShrink: 0, marginTop: 1 }} />
              List your Instagram page so brands can book promo posts, stories & reels.
            </div>
          )}

          <form onSubmit={submit}>
            {/* Base fields */}
            <div className="rc-field"><label>Full Name</label>{inp(base, setBase, 'name')}</div>
            <div className="rc-field"><label>Email</label><input type="email" value={base.email} onChange={e => setBase(p => ({ ...p, email: e.target.value }))} style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none' }} /></div>
            <div className="rc-field"><label>Phone Number</label>{inp(base, setBase, 'phone')}</div>
            <div className="rc-field">
              <label>Password</label>
              <div className="pw-wrap">
                <input type={showPw ? 'text' : 'password'} value={base.password} onChange={e => setBase(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 chars, 1 uppercase, 1 number" style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none' }} />
                <button type="button" className="pw-eye" onClick={() => setShowPw(!showPw)}><i className={`ti ${showPw ? 'ti-eye-off' : 'ti-eye'}`} /></button>
              </div>
            </div>

            {/* Talent fields */}
            {role === 'talent' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem' }}>
                  <div className="rc-field"><label>City</label>{inp(talentF, setTalentF, 'city')}</div>
                  <div className="rc-field"><label>Gender</label>{sel(talentF, setTalentF, 'gender', ['Female', 'Male', 'Other'])}</div>
                </div>
                <div className="rc-field"><label>Category</label>{sel(talentF, setTalentF, 'category', ['Model', 'Influencer', 'UGC Creator', 'Child Artist', 'Photographer', 'Videographer', 'Fitness & Sports', 'Fashion & Styling', 'Food Creator', 'Brand Ambassador', 'Other'])}</div>
                <div className="rc-field"><label>Rate per Project (₹)</label><input type="number" value={talentF.rate} onChange={e => setTalentF(p => ({ ...p, rate: e.target.value }))} placeholder="1000" style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none' }} /></div>
              </>
            )}

            {/* IG Page fields */}
            {role === 'igpage' && (
              <>
                <div className="rc-field"><label>Instagram Handle</label>{inp(igF, setIgF, 'handle')}</div>
                <div className="rc-field"><label>Page Niche</label>{sel(igF, setIgF, 'niche', ['Fashion & Lifestyle', 'Food & Restaurant', 'Travel & Adventure', 'Fitness & Health', 'Beauty & Makeup', 'Home Decor', 'Tech & Gadgets', 'Memes & Entertainment', 'Business & Finance', 'Sports', 'Parenting', 'Other'])}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem' }}>
                  <div className="rc-field"><label>Followers</label>{inp(igF, setIgF, 'followers')}</div>
                  <div className="rc-field"><label>Follower Count (number)</label><input type="number" value={igF.followerCount} onChange={e => setIgF(p => ({ ...p, followerCount: e.target.value }))} placeholder="125000" style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none' }} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem' }}>
                  <div className="rc-field"><label>Engagement Rate</label>{inp(igF, setIgF, 'engagementRate')}</div>
                  <div className="rc-field"><label>City</label>{inp(igF, setIgF, 'city')}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.6rem' }}>
                  <div className="rc-field"><label>Post Rate (₹)</label><input type="number" value={igF.postRate} onChange={e => setIgF(p => ({ ...p, postRate: e.target.value }))} placeholder="2500" style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none' }} /></div>
                  <div className="rc-field"><label>Story Rate (₹)</label><input type="number" value={igF.storyRate} onChange={e => setIgF(p => ({ ...p, storyRate: e.target.value }))} placeholder="1200" style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none' }} /></div>
                  <div className="rc-field"><label>Reel Rate (₹)</label><input type="number" value={igF.reelRate} onChange={e => setIgF(p => ({ ...p, reelRate: e.target.value }))} placeholder="4500" style={{ width: '100%', padding: '.56rem .82rem', border: '1.5px solid #E8E8F0', borderRadius: 9, fontSize: '.84rem', fontFamily: 'Inter', outline: 'none' }} /></div>
                </div>
              </>
            )}

            {/* Brand fields */}
            {role === 'brand' && (
              <>
                <div className="rc-field"><label>Brand / Agency Name</label>{inp(brandF, setBrandF, 'brandName')}</div>
                <div className="rc-field">
                  <label>Select Plan</label>
                  {sel(brandF, setBrandF, 'plan', [
                    { v: 'starter', l: 'Starter — ₹2,999/mo (5 requests)' },
                    { v: 'growth',  l: 'Growth — ₹5,999/mo (20 requests)' },
                    { v: 'pro',     l: 'Pro — ₹9,999/mo (Unlimited)' },
                  ])}
                </div>
              </>
            )}

            {err && <p style={{ fontSize: '.78rem', color: '#FF4757', marginBottom: '.6rem' }}>{err}</p>}
            <button type="submit" disabled={mutation.isPending}
              style={{ width: '100%', padding: '.68rem', borderRadius: 9, fontSize: '.9rem', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Inter', marginTop: '.3rem', color: '#fff',
                background: role === 'igpage' ? 'linear-gradient(135deg,#E1306C,#F77737)' : role === 'brand' ? 'linear-gradient(135deg,#00C896,#00A87A)' : 'linear-gradient(135deg,#6C63FF,#8B85FF)',
              }}>
              {mutation.isPending ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '.8rem', color: '#8888AA', marginTop: '.9rem' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: '#6C63FF', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
