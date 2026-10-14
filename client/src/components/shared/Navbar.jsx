import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const dashLink = () => {
    if (!user) return '/login';
    const map = { talent: '/dashboard/talent', igpage: '/dashboard/igpage', brand: '/dashboard/brand', admin: '/dashboard/admin' };
    return map[user.role] || '/';
  };

  return (
    <nav className="rc-nav">
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        <div style={{
          width: 32, height: 32, background: 'linear-gradient(135deg,#6C63FF,#8B85FF)',
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="ti ti-video" style={{ color: '#fff', fontSize: '1rem' }} />
        </div>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-.5px' }}>
          Reel<span style={{ color: '#6C63FF' }}>Cast</span>
        </span>
      </Link>

      {/* Nav links */}
      <ul style={{ display: 'flex', gap: '1.8rem', listStyle: 'none', margin: 0, padding: 0 }}
          className="d-none d-md-flex">
        <li><Link to="/#how" style={{ color: '#8888AA', fontSize: '.85rem', fontWeight: 500 }}>How It Works</Link></li>
        <li><Link to="/#pricing" style={{ color: '#8888AA', fontSize: '.85rem', fontWeight: 500 }}>Pricing</Link></li>
        <li><Link to="/#talent" style={{ color: '#8888AA', fontSize: '.85rem', fontWeight: 500 }}>Talent</Link></li>
      </ul>

      {/* Right side */}
      <div style={{ display: 'flex', gap: '.7rem', alignItems: 'center' }}>
        {isAuthenticated && user ? (
          <>
            <Link to={dashLink()} style={{
              display: 'flex', alignItems: 'center', gap: '.5rem',
              fontSize: '.85rem', fontWeight: 600,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg,#6C63FF,#8B85FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '.8rem', fontWeight: 700,
              }}>
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="d-none d-md-inline">{user.name?.split(' ')[0]}</span>
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: 'none', border: '1.5px solid #E8E8F0', color: '#8888AA',
                padding: '.32rem .75rem', borderRadius: '7px', fontSize: '.76rem',
                fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif',
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-rc ghost">Sign In</Link>
            <Link to="/register" className="btn-rc primary">Join Free</Link>
          </>
        )}
      </div>
    </nav>
  );
}
