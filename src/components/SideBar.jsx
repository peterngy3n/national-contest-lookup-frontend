import { Link, useLocation } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>National Contest</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link 
              to="/dashboard" 
              className={location.pathname === '/dashboard' ? 'active' : ''}
              onClick={onClose}
            >
              <span>Thống kê</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/search-scores" 
              className={location.pathname === '/search-scores' ? 'active' : ''}
              onClick={onClose}
            >
              <span>Tra cứu</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/reports" 
              className={location.pathname === '/reports' ? 'active' : ''}
              onClick={onClose}
            >
              <span>TOP 10</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;