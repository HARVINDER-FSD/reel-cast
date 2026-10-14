import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div>
        <div style={{ fontSize: '5rem', fontWeight: 900, color: '#6C63FF', letterSpacing: -2 }}>404</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '.5rem' }}>Page Not Found</h2>
        <p style={{ color: '#8888AA', marginBottom: '1.5rem' }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-rc primary"><i className="ti ti-home" /> Back to Home</Link>
      </div>
    </div>
  );
}
