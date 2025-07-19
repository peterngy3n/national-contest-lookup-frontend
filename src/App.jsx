import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/SideBar';
import DashboardScreen from './pages/DashboardScreen';
import SearchScreen from './pages/SearchScreen';
import ReportScreen from './pages/ReportScreen';
import './styles/Layout.css';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Router>
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        {/* Mobile menu button */}
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          ☰
        </button>
        
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              display: window.innerWidth <= 768 ? 'block' : 'none'
            }}
            onClick={closeSidebar}
          />
        )}
        
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/search-scores" element={<SearchScreen />} />
            <Route path="/reports" element={<ReportScreen />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App
