import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ExpensesPage from "./pages/ExpensesPage";

function Home() {
  return <h2>Welcome to Anti-Flex 💰</h2>;
}

function About() {
  return <h2>About Anti-Flex</h2>;
}

function NotFound() {
  return <h2>404 - Page Not Found 🚫</h2>;
}

export default function App() {
  return (
    <BrowserRouter>
      <header>
        <h1>Anti-Flex</h1>
      </header>

      {/* Navigation */}
      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>Home</Link>
        <Link to="/expenses" style={{ marginRight: "1rem" }}>Expenses</Link>
        <Link to="/about">About</Link>
      </nav>

      {/* Page Content */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer>
        <p>© {new Date().getFullYear()} Anti-Flex. All rights reserved.</p>
      </footer>
    </BrowserRouter>
  );
}