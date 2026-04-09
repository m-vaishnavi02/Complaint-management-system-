import { StatusBadge, PriorityBadge, CategoryBadge } from './Badges';

export default function DetailModal({ complaint: c, onClose, onEdit, onDelete }) {
  if (!c) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{c.complaintId} · {c.customerName}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="detail-badges">
            <StatusBadge   status={c.status} />
            <CategoryBadge category={c.category} />
            <PriorityBadge priority={c.priority} />
          </div>

          <div className="note-bubble" style={{ marginBottom: 16 }}>{c.issue}</div>

          <div className="detail-row">
            <span className="detail-key">Customer</span>
            <span className="detail-val">{c.customerName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-key">Email</span>
            <span className="detail-val" style={{ color: 'var(--blue)' }}>{c.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-key">Phone</span>
            <span className="detail-val">{c.phone}</span>
          </div>
          <div className="detail-row">
            <span className="detail-key">Filed on</span>
            <span className="detail-val">{c.createdDate}</span>
          </div>
          <div className="detail-row">
            <span className="detail-key">Last updated</span>
            <span className="detail-val">{c.updatedDate}</span>
          </div>

          {c.notes && (
            <>
              <div className="section-label">Internal Notes</div>
              <div className="note-bubble notes-bubble">{c.notes}</div>
            </>
          )}

          <div className="section-label">Status History</div>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-date">{c.createdDate}</div>
              <div className="timeline-text">
                Complaint filed · Status set to <strong>Open</strong>
              </div>
            </div>
            {c.status !== 'Open' && (
              <div className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-date">{c.updatedDate}</div>
                <div className="timeline-text">
                  Status updated to <strong>{c.status}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-danger" onClick={() => { onClose(); onDelete(c.id); }}>
            Delete
          </button>
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={() => { onClose(); onEdit(c); }}>
            Edit →
          </button>
        </div>
      </div>
    </div>
  );
}
