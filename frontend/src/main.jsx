
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./index.css"; // Import CSS
import React, { useState } from "react";

function Home() {
  return <h2>Welcome to Anti-Flex 💰</h2>;
}

function Expenses() {
  const [expenses, setExpenses] = useState([
    { id: 1, title: "Coffee", amount: 4.5, date: "2025-08-01" },
    { id: 2, title: "Groceries", amount: 52.3, date: "2025-08-15" },
    { id: 3, title: "Netflix Subscription", amount: 15.99, date: "2025-08-20" },
  ]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !amount || !date) return alert("Please fill all fields!");

    if (editingId) {
      // Edit existing expense
      setExpenses(
        expenses.map((exp) =>
          exp.id === editingId
            ? { ...exp, title, amount: parseFloat(amount), date }
            : exp
        )
      );
      setEditingId(null);
    } else {
      // Add new expense
      const newExpense = {
        id: expenses.length + 1,
        title,
        amount: parseFloat(amount),
        date,
      };
      setExpenses([...expenses, newExpense]);
    }

    // Reset form
    setTitle("");
    setAmount("");
    setDate("");
  };

  const handleDelete = (id) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const handleEdit = (expense) => {
    setTitle(expense.title);
    setAmount(expense.amount);
    setDate(expense.date);
    setEditingId(expense.id);
  };

  return (
    <div>
      <h2>My Expenses</h2>

      {/* Add/Edit Expense Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type="submit">{editingId ? "Update Expense" : "Add Expense"}</button>
        {editingId && (
          <button type="button" onClick={() => setEditingId(null)}>
            Cancel
          </button>
        )}
      </form>

      {/* Expenses Table */}
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Amount ($)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.date}</td>
              <td>{expense.title}</td>
              <td>{expense.amount.toFixed(2)}</td>
              <td>
                <button onClick={() => handleEdit(expense)}>Edit</button>
                <button onClick={() => handleDelete(expense.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function About() {
  return <h2>About Anti-Flex</h2>;
}

function NotFound() {
  return <h2>404 - Page Not Found 🚫</h2>;
}

function App() {
  return (
    <BrowserRouter>
      <header>
        <h1>Anti-Flex</h1>
      </header>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/expenses">Expenses</Link>
        <Link to="/about">About</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/expenses" element={<Expenses />} />
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

ReactDOM.createRoot(document.getElementById("root")).render(<App />);