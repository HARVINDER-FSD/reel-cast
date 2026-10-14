import React from 'react';

export default function Spinner({ fullScreen = false, size = 40 }) {
  const el = (
    <div
      style={{
        width: size, height: size,
        border: '3px solid #EEEDFF',
        borderTopColor: '#6C63FF',
        borderRadius: '50%',
        animation: 'spin .7s linear infinite',
      }}
    />
  );
  if (fullScreen) {
    return <div className="spinner-overlay">{el}</div>;
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
      {el}
    </div>
  );
}
