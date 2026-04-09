import { useEffect, useState } from 'react';
import { analyticsApi, complaintsApi } from '../api/complaintsApi';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badges';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  'Open':        '#58a6ff',
  'In Progress': '#d29922',
  'Resolved':    '#3fb950',
  'Closed':      '#6e7681',
};
const CAT_COLORS = {
  Billing: 'var(--amber)', Technical: 'var(--blue)', Delivery: 'var(--purple)',
  Product: 'var(--green)', Account: 'var(--red)',    Other: 'var(--text3)',
};

export default function Dashboard({ onNewComplaint }) {
  const [summary, setSummary]   = useState(null);
  const [catData, setCatData]   = useState([]);
  const [statusData, setStatus] = useState([]);
  const [recent, setRecent]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [sum, cats, statuses, rec] = await Promise.all([
          analyticsApi.summary(),
          analyticsApi.byCategory(),
          analyticsApi.byStatus(),
          complaintsApi.getAll({ page: 0, size: 5, sortBy: 'createdDate', sortDir: 'desc' }),
        ]);
        setSummary(sum);
        setCatData(cats);
        setStatus(statuses);
        setRecent(rec.content || []);
      } catch (_) {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return (
    <div className="loading"><div className="spinner" /> Loading dashboard…</div>
  );

  const totalStatus = statusData.reduce((a, b) => a + Number(b.count), 0) || 1;
  const maxCat = Math.max(...catData.map(c => Number(c.count)), 1);

  // SVG donut
  const r = 60, cx = 70, cy = 70, sw = 20, circ = 2 * Math.PI * r;
  let offset = 0;
  const donutPaths = statusData.map(s => {
    const pct  = Number(s.count) / totalStatus;
    const dash = pct * circ;
    const path = (
      <circle key={s.status}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={STATUS_COLORS[s.status] || '#6e7681'}
        strokeWidth={sw}
        strokeDasharray={`${dash.toFixed(1)} ${(circ - dash).toFixed(1)}`}
        strokeDashoffset={(-offset * circ / totalStatus).toFixed(1)}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    );
    offset += Number(s.count);
    return path;
  });

  return (
    <div>
      {/* Metrics */}
      <div className="metrics-grid">
        <MetricCard label="Total Complaints" value={summary?.total ?? 0}   color="amber" icon="◫" sub="All time" />
        <MetricCard label="Open"             value={summary?.open ?? 0}    color="blue"  icon="◎" sub="Awaiting action" />
        <MetricCard label="Resolved"         value={summary?.resolved ?? 0}color="green" icon="✓" sub={`Rate: ${summary?.resolutionRate ?? 0}%`} />
        <MetricCard label="High Priority"    value={summary?.highPriority ?? 0} color="red" icon="!" sub="Needs immediate attention" />
      </div>

      {/* Charts row */}
      <div className="analytics-grid">
        {/* Category bar chart */}
        <div className="panel">
          <div className="panel-header"><span className="panel-title">◧ Complaints by Category</span></div>
          <div className="panel-body">
            <div className="chart-bar-wrap">
              {catData.map(c => (
                <div key={c.category} className="chart-bar-item">
                  <div className="chart-bar-label">{c.category}</div>
                  <div className="chart-bar-track">
                    <div className="chart-bar-fill"
                      style={{
                        width: `${Math.round((Number(c.count) / maxCat) * 100)}%`,
                        background: CAT_COLORS[c.category] + '20',
                        borderLeft: `3px solid ${CAT_COLORS[c.category]}`,
                      }}>
                      <span className="chart-bar-val" style={{ color: CAT_COLORS[c.category] }}>
                        {c.count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status donut */}
        <div className="panel">
          <div className="panel-header"><span className="panel-title">◎ Status Breakdown</span></div>
          <div className="panel-body">
            <div className="donut-wrap">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg3)" strokeWidth={sw} />
                {donutPaths}
                <text x={cx} y={cy - 6}  textAnchor="middle" fill="var(--text)"  fontSize="20" fontFamily="Fraunces,serif" fontWeight="600">{summary?.total ?? 0}</text>
                <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text3)" fontSize="10" fontFamily="DM Mono,monospace">total</text>
              </svg>
              <div className="donut-legend">
                {statusData.map(s => (
                  <div key={s.status} className="donut-legend-item">
                    <div className="donut-dot" style={{ background: STATUS_COLORS[s.status] || '#6e7681' }} />
                    {s.status}
                    <span className="donut-count">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent complaints */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">⌛ Recent Complaints</span>
          <button className="btn btn-sm" onClick={() => navigate('/complaints')}>View all →</button>
        </div>
        <div className="table-wrap">
          {recent.length === 0
            ? <div className="empty-state"><div className="empty-icon">◫</div><div className="empty-title">No complaints yet</div></div>
            : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Customer</th><th>Category</th>
                    <th>Priority</th><th>Status</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(c => (
                    <tr key={c.id}>
                      <td className="td-id">{c.complaintId}</td>
                      <td className="td-name">{c.customerName}</td>
                      <td><CategoryBadge category={c.category} /></td>
                      <td><PriorityBadge priority={c.priority} /></td>
                      <td><StatusBadge   status={c.status}    /></td>
                      <td className="td-date">{c.createdDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color, icon, sub }) {
  const colors = { amber: 'var(--amber)', blue: 'var(--blue)', green: 'var(--green)', red: 'var(--red)' };
  return (
    <div className={`metric-card c-${color}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={{ color: colors[color] }}>{value}</div>
      <div className="metric-sub">{sub}</div>
      <div className="metric-icon">{icon}</div>
    </div>
  );
}
