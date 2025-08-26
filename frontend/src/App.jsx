import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import ExpensesPage from "./pages/ExpensesPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
  return <h2>Welcome to Anti-Flex</h2>;
}

function About() {
  return <h2>About Anti-Flex</h2>;
}

function NotFound() {
  return <h2>404 - Page Not Found</h2>;
}

export default function App() {
  // Important: put hooks that need router context *inside* Shell
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}

function Shell() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(() => localStorage.getItem("access_token"));

  // Keep token in sync when route changes (e.g., after login/logout navigations)
  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setToken(null);            // update UI immediately
    navigate("/login");        // go to login
  };

  // Make nav items look consistent
  const navItemStyle = {
    marginRight: "1rem",
    color: "white",
    textDecoration: "none",
    cursor: "pointer",
    fontWeight: 400,
  };

  return (
    <>
      <header>
        <h1>Anti-Flex</h1>
      </header>

      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/" style={navItemStyle}>Home</Link>
        <Link to="/expenses" style={navItemStyle}>Expenses</Link>
        <Link to="/about" style={navItemStyle}>About</Link>

        {!token ? (
          <Link to="/login" style={navItemStyle}>Login</Link>
        ) : (
          // span instead of button so it blends with the links
          <span onClick={handleLogout} style={navItemStyle}>Logout</span>
        )}
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <ExpensesPage />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer>
        <p>© {new Date().getFullYear()} Anti-Flex. All rights reserved.</p>
      </footer>
    </>
  );
}
