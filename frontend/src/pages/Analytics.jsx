import { useEffect, useState } from 'react';
import { analyticsApi } from '../api/complaintsApi';
import { useToast } from '../context/ToastContext';

const PRI_COLORS = { High: 'var(--red)', Medium: 'var(--yellow)', Low: 'var(--green)' };
const STATUS_COLORS = {
  'Open': '#58a6ff', 'In Progress': '#d29922', 'Resolved': '#3fb950', 'Closed': '#6e7681',
};

export default function Analytics() {
  const toast = useToast();
  const [summary,    setSummary]    = useState(null);
  const [resolution, setResolution] = useState([]);
  const [priority,   setPriority]   = useState([]);
  const [trend,      setTrend]      = useState([]);
  const [statuses,   setStatuses]   = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sum, res, pri, tr, st] = await Promise.all([
          analyticsApi.summary(),
          analyticsApi.resolutionByCategory(),
          analyticsApi.byPriority(),
          analyticsApi.monthlyTrend(),
          analyticsApi.byStatus(),
        ]);
        setSummary(sum);
        setResolution(res);
        setPriority(pri);
        setTrend(tr);
        setStatuses(st);
      } catch (e) {
        toast(e.message || 'Failed to load analytics', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line

  if (loading) return <div className="loading"><div className="spinner" /> Loading analytics…</div>;

  const maxTrend = Math.max(...trend.map(t => Number(t.count)), 1);
  const maxPri   = Math.max(...priority.map(p => Number(p.count)), 1);

  return (
    <div>
      {/* Summary metrics */}
      <div className="metrics-grid">
        <MetricCard label="Resolution Rate"  value={`${summary?.resolutionRate ?? 0}%`} color="green" />
        <MetricCard label="Total Complaints" value={summary?.total ?? 0}                 color="amber" />
        <MetricCard label="In Progress"      value={summary?.inProgress ?? 0}            color="blue"  />
        <MetricCard label="Open Unresolved"  value={summary?.open ?? 0}                  color="red"   />
      </div>

      <div className="analytics-grid">
        {/* Resolution by Category */}
        <div className="panel">
          <div className="panel-header"><span className="panel-title">◧ Resolution Rate by Category</span></div>
          <div className="panel-body">
            {resolution.length === 0
              ? <EmptyChart />
              : (
                <div className="chart-bar-wrap">
                  {resolution.map(r => (
                    <div key={r.category} className="chart-bar-item">
                      <div className="chart-bar-label">{r.category}</div>
                      <div className="chart-bar-track">
                        <div className="chart-bar-fill"
                          style={{
                            width: `${r.resolutionRate}%`,
                            background: 'var(--green-bg)',
                            borderLeft: '3px solid var(--green)',
                          }}>
                          <span className="chart-bar-val" style={{ color: 'var(--green)' }}>
                            {r.resolutionRate}%
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', width: 50, textAlign: 'right' }}>
                        {r.resolved}/{r.total}
                      </span>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>

        {/* Priority distribution */}
        <div className="panel">
          <div className="panel-header"><span className="panel-title">⬡ Priority Distribution</span></div>
          <div className="panel-body">
            {priority.length === 0
              ? <EmptyChart />
              : (
                <div className="chart-bar-wrap">
                  {priority.map(p => (
                    <div key={p.priority} className="chart-bar-item">
                      <div className="chart-bar-label">{p.priority}</div>
                      <div className="chart-bar-track">
                        <div className="chart-bar-fill"
                          style={{
                            width: `${Math.round((Number(p.count) / maxPri) * 100)}%`,
                            background: PRI_COLORS[p.priority] + '20',
                            borderLeft: `3px solid ${PRI_COLORS[p.priority]}`,
                          }}>
                          <span className="chart-bar-val" style={{ color: PRI_COLORS[p.priority] }}>
                            {p.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>

      {/* Monthly trend */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-header"><span className="panel-title">⌛ Monthly Trend (Complaints Filed)</span></div>
        <div className="panel-body">
          {trend.length === 0
            ? <EmptyChart label="No trend data available yet." />
            : (
              <div className="trend-bars">
                {trend.map((t, i) => (
                  <div key={i} className="trend-bar-wrap">
                    <div className="trend-bar-count">{t.count}</div>
                    <div
                      className="trend-bar"
                      style={{ height: `${Math.round((Number(t.count) / maxTrend) * 100)}px` }}
                    />
                    <div className="trend-bar-label" style={{ transform: `translateX(-50%)`, left: '50%' }}>
                      {t.label}
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>

      {/* Status breakdown table */}
      <div className="panel">
        <div className="panel-header"><span className="panel-title">◎ Status Breakdown</span></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Status</th><th>Count</th><th>Share</th><th>Visual</th></tr>
            </thead>
            <tbody>
              {statuses.map(s => {
                const pct = summary?.total ? Math.round((Number(s.count) / summary.total) * 100) : 0;
                const col = STATUS_COLORS[s.status] || '#6e7681';
                return (
                  <tr key={s.status}>
                    <td>
                      <span className="badge" style={{ background: col + '20', color: col }}>
                        <span className="badge-dot" style={{ background: col }} />
                        {s.status}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{s.count}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)' }}>{pct}%</td>
                    <td style={{ width: '40%' }}>
                      <div style={{ background: 'var(--bg3)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 4, transition: 'width 0.5s' }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }) {
  const colors = { amber: 'var(--amber)', blue: 'var(--blue)', green: 'var(--green)', red: 'var(--red)' };
  return (
    <div className={`metric-card c-${color}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={{ color: colors[color] }}>{value}</div>
    </div>
  );
}

function EmptyChart({ label = 'No data available.' }) {
  return <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '24px', fontSize: 13 }}>{label}</div>;
}
