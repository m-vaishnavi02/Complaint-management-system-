import { NavLink, useNavigate } from 'react-router-dom';

export default function Sidebar({ openCount, onNewComplaint }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">📋</div>
        <div>
          <div className="sidebar-logo-name">ComplaintDesk</div>
          <div className="sidebar-logo-ver">v2.0 · Full Stack</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>

        <NavLink to="/" end className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <span className="nav-icon">⊞</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/complaints" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <span className="nav-icon">◫</span>
          <span>Complaints</span>
          {openCount > 0 && <span className="nav-badge">{openCount}</span>}
        </NavLink>

        <NavLink to="/analytics" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <span className="nav-icon">◈</span>
          <span>Analytics</span>
        </NavLink>

        <div className="nav-section-label" style={{ marginTop: 12 }}>Quick</div>

        <div className="nav-item" onClick={onNewComplaint} style={{ cursor: 'pointer' }}>
          <span className="nav-icon">＋</span>
          <span>New Complaint</span>
        </div>
      </nav>

      <div className="sidebar-footer">© 2025 ComplaintDesk</div>
    </aside>
  );
}
