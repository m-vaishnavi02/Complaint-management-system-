import { useEffect, useState, useCallback } from 'react';
import { complaintsApi } from '../api/complaintsApi';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badges';
import ComplaintModal from '../components/ComplaintModal';
import DetailModal    from '../components/DetailModal';
import { useToast }   from '../context/ToastContext';

const COLS = [
  { key: 'complaintId',  label: 'ID',        sortKey: 'complaintId'  },
  { key: 'customerName', label: 'Customer',   sortKey: 'customerName' },
  { key: 'category',     label: 'Category',   sortKey: 'category'     },
  { key: 'priority',     label: 'Priority',   sortKey: 'priority'     },
  { key: 'status',       label: 'Status',     sortKey: 'status'       },
  { key: 'issue',        label: 'Issue',      sortKey: null           },
  { key: 'createdDate',  label: 'Date',       sortKey: 'createdDate'  },
  { key: '_actions',     label: '',           sortKey: null           },
];

export default function Complaints({ onCountChange }) {
  const toast = useToast();

  // ── Data ────────────────────────────────────────────────────
  const [data,     setData]     = useState({ content: [], totalElements: 0, totalPages: 1 });
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  // ── Filters ─────────────────────────────────────────────────
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [page,     setPage]     = useState(0);
  const [sortBy,   setSortBy]   = useState('createdDate');
  const [sortDir,  setSortDir]  = useState('desc');

  // ── Modals ──────────────────────────────────────────────────
  const [editTarget,   setEditTarget]   = useState(null);  // null | {} | complaint
  const [detailTarget, setDetailTarget] = useState(null);
  const [showEdit,     setShowEdit]     = useState(false);
  const [showDetail,   setShowDetail]   = useState(false);

  const SIZE = 10;

  // ── Fetch ───────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await complaintsApi.getAll({ search, status, category, priority, page, size: SIZE, sortBy, sortDir });
      setData(res);
      onCountChange?.(res.content?.filter(c => c.status === 'Open').length ?? 0);
    } catch (e) {
      toast(e.message || 'Failed to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, status, category, priority, page, sortBy, sortDir]); // eslint-disable-line

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Search debounce ─────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Sort ────────────────────────────────────────────────────
  function handleSort(key) {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('desc'); }
    setPage(0);
  }

  // ── CRUD handlers ────────────────────────────────────────────
  async function handleSave(form) {
    setSaving(true);
    try {
      if (editTarget?.id) {
        await complaintsApi.update(editTarget.id, form);
        toast(`${editTarget.complaintId} updated.`, 'success');
      } else {
        await complaintsApi.create(form);
        toast('Complaint submitted successfully.', 'success');
      }
      setShowEdit(false);
      fetchData();
    } catch (e) {
      toast(e.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const c = data.content.find(x => x.id === id);
    if (!window.confirm(`Delete ${c?.complaintId}? This cannot be undone.`)) return;
    try {
      await complaintsApi.delete(id);
      toast(`${c?.complaintId} deleted.`, 'info');
      fetchData();
    } catch (e) {
      toast(e.message || 'Delete failed', 'error');
    }
  }

  function openNew()  { setEditTarget(null); setShowEdit(true); }
  function openEdit(c){ setEditTarget(c);    setShowEdit(true); }

  // ── Pagination helpers ──────────────────────────────────────
  const totalPages = data.totalPages || 1;
  function pageNums() {
    const nums = [];
    for (let i = 0; i < totalPages; i++) {
      if (totalPages > 7 && i > 2 && i < totalPages - 3 && Math.abs(i - page) > 1) {
        if (i === 3) nums.push('…');
        continue;
      }
      nums.push(i);
    }
    return nums;
  }

  const start = data.totalElements ? page * SIZE + 1 : 0;
  const end   = Math.min((page + 1) * SIZE, data.totalElements);

  return (
    <div>
      <div className="panel">
        {/* Header with filters */}
        <div className="panel-header">
          <span className="panel-title">◫ All Complaints</span>
          <div className="filters">
            <div className="search-wrap">
              <span className="search-icon">⌕</span>
              <input
                type="text"
                className="search"
                placeholder="Search complaints…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
            <select value={status}   onChange={e => { setStatus(e.target.value);   setPage(0); }} style={{ width: 'auto' }}>
              <option value="">All statuses</option>
              {['Open','In Progress','Resolved','Closed'].map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={category} onChange={e => { setCategory(e.target.value); setPage(0); }} style={{ width: 'auto' }}>
              <option value="">All categories</option>
              {['Billing','Technical','Delivery','Product','Account','Other'].map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={priority} onChange={e => { setPriority(e.target.value); setPage(0); }} style={{ width: 'auto' }}>
              <option value="">All priorities</option>
              {['High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
            </select>
            <button className="btn btn-sm" onClick={() => { setSearchInput(''); setStatus(''); setCategory(''); setPriority(''); setPage(0); }}>✕ Clear</button>
            <button className="btn btn-sm btn-primary" onClick={openNew}>＋ New</button>
          </div>
        </div>

        {/* Table */}
        {loading
          ? <div className="loading"><div className="spinner" /> Loading…</div>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {COLS.map(col => (
                      <th
                        key={col.key}
                        className={sortBy === col.sortKey ? 'sorted' : ''}
                        onClick={col.sortKey ? () => handleSort(col.sortKey) : undefined}
                        style={!col.sortKey ? { cursor: 'default' } : {}}
                      >
                        {col.label}
                        {col.sortKey && (
                          <span className="sort-arrow" style={{ marginLeft: 4, fontSize: 10, opacity: sortBy === col.sortKey ? 1 : 0.4 }}>
                            {sortBy === col.sortKey ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.content.length === 0
                    ? (
                      <tr>
                        <td colSpan={8}>
                          <div className="empty-state">
                            <div className="empty-icon">◫</div>
                            <div className="empty-title">No complaints found</div>
                            <div>Try adjusting your filters or search term.</div>
                          </div>
                        </td>
                      </tr>
                    )
                    : data.content.map(c => (
                      <tr key={c.id}>
                        <td className="td-id">{c.complaintId}</td>
                        <td className="td-name">{c.customerName}</td>
                        <td><CategoryBadge category={c.category} /></td>
                        <td><PriorityBadge priority={c.priority} /></td>
                        <td><StatusBadge   status={c.status}    /></td>
                        <td className="td-issue" title={c.issue}>{c.issue}</td>
                        <td className="td-date">{c.createdDate}</td>
                        <td>
                          <div className="row-actions">
                            <button className="btn btn-sm btn-icon" title="View"   onClick={() => { setDetailTarget(c); setShowDetail(true); }}>◉</button>
                            <button className="btn btn-sm btn-icon" title="Edit"   onClick={() => openEdit(c)}>✎</button>
                            <button className="btn btn-sm btn-icon btn-danger" title="Delete" onClick={() => handleDelete(c.id)}>✕</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )
        }

        {/* Pagination */}
        <div className="pagination">
          <div className="pagination-info">
            Showing {start}–{end} of {data.totalElements} complaints
          </div>
          <div className="page-btns">
            <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
            {pageNums().map((n, i) =>
              n === '…'
                ? <span key={`e${i}`} className="page-ellipsis">…</span>
                : <button key={n} className={`page-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n + 1}</button>
            )}
            <button className="page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEdit && (
        <ComplaintModal
          complaint={editTarget}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
          loading={saving}
        />
      )}
      {showDetail && (
        <DetailModal
          complaint={detailTarget}
          onClose={() => setShowDetail(false)}
          onEdit={c => openEdit(c)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
