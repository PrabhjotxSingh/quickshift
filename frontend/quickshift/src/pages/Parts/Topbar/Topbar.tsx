import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { useState } from "react";
import "./Topbar.css";

export default function Topbar() {
  const { role } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleHamburgerClick = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div className="bar">
      <div className="logo">QuickShift</div>

      <div className={`hamburger ${isMenuOpen ? "active" : ""}`} onClick={handleHamburgerClick}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
        {role && role === "employer" && (
          <>
            <Link to="/dashboard-employer">Dashboard</Link>
            <Link to="/payment">Payment</Link>
            <Link to="/shifts">Shifts</Link>
          </>
        )}
        {role && role === "employee" && (
          <>
            <Link to="/dashboard-employee">Dashboard</Link>
            <Link to="/payment">Payment</Link>
            <Link to="/shifts">Shifts</Link>
          </>
        )}
        {!role && <Link to="/login">Login</Link>}

        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </div>
    </div>
  );
}
