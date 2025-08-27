import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [username, setUsername] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
    const idToken = localStorage.getItem("id_token");
    if (idToken) {
      try {
        const payload = JSON.parse(atob(idToken.split(".")[1]));
        setUsername(payload.email || payload.username || "");
      } catch {
        setUsername("");
      }
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setUsername("");
    navigate("/login");
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`px-3 py-2 font-medium transition-colors ${
        location.pathname === to
          ? "text-blue-600 font-bold"
          : "text-gray-700 hover:text-blue-600"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-14">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-blue-600">
          Anti-Flex
        </Link>

        {/* Links */}
        <div className="flex items-center space-x-6">
          {navLink("/", "Home")}
          {navLink("/expenses", "Expenses")}
          {navLink("/dashboard", "Dashboard")}
          {navLink("/about", "About")}

          {!token ? (
            <>
              {navLink("/login", "Login")}
              {navLink("/register", "Register")} {/* ✅ Register link */}
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="px-3 py-2 font-medium text-gray-700 hover:text-blue-600"
            >
              Logout {username && `(${username})`}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
