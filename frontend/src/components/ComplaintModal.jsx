import { useState, useEffect } from 'react';

const CATS       = ['Billing','Technical','Delivery','Product','Account','Other'];
const STATUSES   = ['Open','In Progress','Resolved','Closed'];
const PRIORITIES = ['High','Medium','Low'];

const EMPTY = {
  customerName: '',
  email: '',
  phone: '',
  category: 'Billing',
  priority: 'Medium',
  status: 'Open',
  issue: '',
  notes: '',
};

function validate(d) {
  const e = {};
  if (!d.customerName?.trim() || d.customerName.trim().length < 2)
    e.customerName = 'Name must be at least 2 characters.';
  if (!d.email?.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(d.email))
    e.email = 'Enter a valid email address.';
  if (!d.phone?.trim() || !/^\d{10}$/.test(d.phone.replace(/\s/g, '')))
    e.phone = 'Phone must be exactly 10 digits.';
  if (!d.issue?.trim() || d.issue.trim().length < 10)
    e.issue = 'Describe the issue (min 10 characters).';
  return e;
}

export default function ComplaintModal({ complaint, onClose, onSave, loading }) {
  const isEdit = Boolean(complaint?.id);
  const [form, setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (complaint) {
      setForm({
        customerName: complaint.customerName || '',
        email:        complaint.email        || '',
        phone:        complaint.phone        || '',
        category:     complaint.category     || 'Billing',
        priority:     complaint.priority     || 'Medium',
        status:       complaint.status       || 'Open',
        issue:        complaint.issue        || '',
        notes:        complaint.notes        || '',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [complaint]);

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  }

  function Field({ id, label, children, full }) {
    return (
      <div className={`form-group${full ? ' full' : ''}`}>
        <label htmlFor={id}>{label}</label>
        {children}
        {errors[id] && <div className="error-msg">{errors[id]}</div>}
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">
            {isEdit ? `Edit · ${complaint.complaintId}` : 'New Complaint'}
          </span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-grid">
              <Field id="customerName" label="Customer Name *">
                <input
                  id="customerName"
                  type="text"
                  value={form.customerName}
                  onChange={e => set('customerName', e.target.value)}
                  placeholder="Full name"
                  className={errors.customerName ? 'error' : ''}
                />
              </Field>

              <Field id="email" label="Email Address *">
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="email@example.com"
                  className={errors.email ? 'error' : ''}
                />
              </Field>

              <Field id="phone" label="Phone Number *">
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="10-digit number"
                  className={errors.phone ? 'error' : ''}
                />
              </Field>

              <Field id="category" label="Category">
                <select id="category" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>

              <Field id="priority" label="Priority">
                <select id="priority" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>

              <Field id="status" label="Status">
                <select id="status" value={form.status} onChange={e => set('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>

              <Field id="issue" label="Issue Description *" full>
                <textarea
                  id="issue"
                  rows={3}
                  value={form.issue}
                  onChange={e => set('issue', e.target.value)}
                  placeholder="Describe the complaint in detail (min 10 characters)…"
                  className={errors.issue ? 'error' : ''}
                />
              </Field>

              <Field id="notes" label="Internal Notes" full>
                <textarea
                  id="notes"
                  rows={2}
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="Notes visible only to agents…"
                />
              </Field>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
