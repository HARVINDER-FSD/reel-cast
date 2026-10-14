import React from 'react';
import EmptyState from './EmptyState.jsx';

const STATUS_COLOR = { pending: 'pending', approved: 'approved', rejected: 'rejected', completed: 'completed', cancelled: 'cancelled' };

export default function BookingsTable({ bookings = [], role, onApprove, onReject, onComplete, onView }) {
  if (!bookings.length) return <EmptyState icon="📋" title="No bookings yet" desc="Requests will appear here." />;

  return (
    <div className="tbl-card">
      <table>
        <thead>
          <tr>
            {role === 'brand' && <th>Name / Page</th>}
            {(role === 'talent' || role === 'igpage') && <th>Brand</th>}
            {role === 'admin' && <><th>Talent / Page</th><th>Brand</th></>}
            <th>Type</th>
            <th>Date</th>
            <th>Status</th>
            <th>Contact</th>
            {(role === 'admin') && <th>Actions</th>}
            {(role === 'talent' || role === 'igpage') && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const target = b.talent || b.instagramPage;
            const isIG = b.bookingType === 'instagram';
            return (
              <tr key={b._id}>
                {role === 'brand' && (
                  <td>
                    <strong>{target?.handle || target?.name || '—'}</strong>
                    {isIG && <span className="pill igp" style={{ marginLeft: 6, fontSize: '.6rem' }}>IG</span>}
                  </td>
                )}
                {(role === 'talent' || role === 'igpage') && <td><strong>{b.brand?.brandName || b.brand?.name || '—'}</strong></td>}
                {role === 'admin' && (
                  <>
                    <td><strong>{target?.handle || target?.name || '—'}</strong>{isIG && <span className="pill igp" style={{ marginLeft: 5, fontSize: '.6rem' }}>IG</span>}</td>
                    <td>{b.brand?.brandName || b.brand?.name || '—'}</td>
                  </>
                )}
                <td style={{ color: '#8888AA', fontSize: '.78rem' }}>{b.projectType || b.promoType || '—'}</td>
                <td style={{ color: '#8888AA', fontSize: '.78rem' }}>
                  {b.shootDate || b.goLiveDate
                    ? new Date(b.shootDate || b.goLiveDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                    : new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </td>
                <td><span className={`pill ${STATUS_COLOR[b.status] || 'pending'}`}>{cap(b.status)}</span></td>
                <td>
                  {b.status === 'approved' ? (
                    <span style={{ fontSize: '.76rem', color: '#009970', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <i className="ti ti-phone" />
                      {role === 'brand' ? (target?.phone || 'Revealed') : (b.brand?.phone || 'Revealed')}
                    </span>
                  ) : <span style={{ color: '#8888AA' }}>—</span>}
                </td>
                {role === 'admin' && (
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-rc ghost sm" onClick={() => onView?.(b)}>
                        <i className="ti ti-eye" />
                      </button>
                      {b.status === 'pending' && (
                        <>
                          <button className="btn-rc success sm" onClick={() => onApprove?.(b._id)}><i className="ti ti-check" /></button>
                          <button className="btn-rc danger sm" onClick={() => onReject?.(b._id)}><i className="ti ti-x" /></button>
                        </>
                      )}
                    </div>
                  </td>
                )}
                {(role === 'talent' || role === 'igpage') && (
                  <td>
                    {b.status === 'approved' && (
                      <button className="btn-rc success sm" onClick={() => onComplete?.(b._id)}>Mark Complete</button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
