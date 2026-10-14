import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi, getErrorMsg } from '../../services/api.js';
import useAuthStore from '../../store/authStore.js';
import Navbar from '../../components/shared/Navbar.jsx';

const DASH = { talent: '/dashboard/talent', igpage: '/dashboard/igpage', brand: '/dashboard/brand', admin: '/dashboard/admin' };

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');

  const mutation = useMutation({
    mutationFn: () => authApi.login(form),
    onSuccess: (res) => {
      const user = res.data.data.user;
      setUser(user);
      toast.success(`Welcome back, ${user.name?.split(' ')[0]}!`);
      navigate(DASH[user.role] || '/');
    },
    onError: (e) => setErr(getErrorMsg(e)),
  });

  const submit = (e) => {
    e.preventDefault();
    setErr('');
    if (!form.email || !form.password) return setErr('Please fill in all fields.');
    mutation.mutate();
  };

  return (
    <div>
      <Navbar />
      <div className="auth-wrap">
        <div className="auth-box">
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
              <div style={{ width: 26, height: 26, background: 'linear-gradient(135deg,#6C63FF,#8B85FF)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-video" style={{ color: '#fff', fontSize: '.82rem' }} />
              </div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>Reel<span style={{ color: '#6C63FF' }}>Cast</span></span>
            </div>
          </div>

          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '.25rem' }}>Welcome Back</h2>
          <p style={{ fontSize: '.82rem', color: '#8888AA', textAlign: 'center', marginBottom: '1.4rem' }}>Sign in to your account</p>

          <form onSubmit={submit}>
            <div className="rc-field">
              <label>Email Address</label>
              <input type="email" placeholder="you@email.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="rc-field">
              <label>Password</label>
              <div className="pw-wrap">
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" className="pw-eye" onClick={() => setShowPw(!showPw)}>
                  <i className={`ti ${showPw ? 'ti-eye-off' : 'ti-eye'}`} />
                </button>
              </div>
            </div>
            {err && <p style={{ fontSize: '.78rem', color: '#FF4757', marginBottom: '.6rem' }}>{err}</p>}
            <button type="submit" disabled={mutation.isPending}
              style={{ width: '100%', padding: '.68rem', borderRadius: 9, fontSize: '.9rem', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Inter', background: 'linear-gradient(135deg,#6C63FF,#8B85FF)', color: '#fff', marginTop: '.3rem' }}>
              {mutation.isPending ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '.8rem', color: '#8888AA', marginTop: '.9rem' }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#6C63FF', fontWeight: 600 }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
