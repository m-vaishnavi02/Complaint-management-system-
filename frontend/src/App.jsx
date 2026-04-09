import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Sidebar      from './components/Sidebar';
import Dashboard    from './pages/Dashboard';
import Complaints   from './pages/Complaints';
import Analytics    from './pages/Analytics';
import ComplaintModal from './components/ComplaintModal';
import { complaintsApi } from './api/complaintsApi';
import { useToast } from './context/ToastContext';
import './styles/global.css';

const PAGE_META = {
  '/':           { title: 'Dashboard',  sub: 'Complaint management overview' },
  '/complaints': { title: 'Complaints', sub: 'Browse, search and manage all complaints' },
  '/analytics':  { title: 'Analytics',  sub: 'Resolution statistics and insights' },
};

function AppInner() {
  const location = useLocation();
  const toast    = useToast();
  const meta     = PAGE_META[location.pathname] || PAGE_META['/'];

  const [openCount,     setOpenCount]     = useState(0);
  const [showNewModal,  setShowNewModal]  = useState(false);
  const [savingNew,     setSavingNew]     = useState(false);
  // key used to force Complaints page to reload after quick-add from topbar
  const [refreshKey,    setRefreshKey]    = useState(0);

  async function handleQuickAdd(form) {
    setSavingNew(true);
    try {
      await complaintsApi.create(form);
      toast('Complaint submitted successfully.', 'success');
      setShowNewModal(false);
      setRefreshKey(k => k + 1);
    } catch (e) {
      toast(e.message || 'Submit failed', 'error');
    } finally {
      setSavingNew(false);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        openCount={openCount}
        onNewComplaint={() => setShowNewModal(true)}
      />

      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div>
            <div className="topbar-title">{meta.title}</div>
            <div className="topbar-subtitle">{meta.sub}</div>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
              ＋ New Complaint
            </button>
          </div>
        </header>

        {/* Routes */}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard onNewComplaint={() => setShowNewModal(true)} />} />
            <Route path="/complaints" element={<Complaints key={refreshKey} onCountChange={setOpenCount} />} />
            <Route path="/analytics"  element={<Analytics />} />
          </Routes>
        </div>
      </div>

      {/* Quick-add modal */}
      {showNewModal && (
        <ComplaintModal
          complaint={null}
          onClose={() => setShowNewModal(false)}
          onSave={handleQuickAdd}
          loading={savingNew}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </BrowserRouter>
  );
}
