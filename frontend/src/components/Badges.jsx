export function StatusBadge({ status }) {
  const cls = {
    'Open':        'badge badge-open',
    'In Progress': 'badge badge-inprogress',
    'Resolved':    'badge badge-resolved',
    'Closed':      'badge badge-closed',
  }[status] || 'badge';
  return (
    <span className={cls}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const cls = {
    High:   'badge-high',
    Medium: 'badge-medium',
    Low:    'badge-low',
  }[priority] || 'badge-medium';
  return <span className={cls}>{priority}</span>;
}

export function CategoryBadge({ category }) {
  return <span className="badge-cat">{category}</span>;
}
