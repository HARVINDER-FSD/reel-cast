import React from 'react';

export default function Pagination({ page, pages, onPage }) {
  if (!pages || pages <= 1) return null;
  const items = [];
  const delta = 2;
  const range = [];
  for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) range.push(i);
  if (range[0] > 1) { items.push(1); if (range[0] > 2) items.push('...'); }
  range.forEach((r) => items.push(r));
  if (range[range.length - 1] < pages) { if (range[range.length - 1] < pages - 1) items.push('...'); items.push(pages); }

  return (
    <div className="pagination-wrap">
      <button className="page-btn" onClick={() => onPage(page - 1)} disabled={page <= 1}>‹</button>
      {items.map((item, i) =>
        item === '...' ? (
          <span key={`e${i}`} style={{ padding: '0 .4rem', color: '#8888AA', fontSize: '.8rem' }}>…</span>
        ) : (
          <button key={item} className={`page-btn ${item === page ? 'active' : ''}`} onClick={() => onPage(item)}>{item}</button>
        )
      )}
      <button className="page-btn" onClick={() => onPage(page + 1)} disabled={page >= pages}>›</button>
    </div>
  );
}
