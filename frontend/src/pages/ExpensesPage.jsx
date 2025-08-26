import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  // Utility: sort expenses by date (newest first)
  const sortByDate = (items) =>
    [...items].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Load expenses from backend (with token)
  useEffect(() => {
    const token = localStorage.getItem("access_token"); // use access_token
    if (!token) {
      navigate("/login");
      return;
    }
    axios
      .get(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("API response:", res.data);
        setExpenses(Array.isArray(res.data) ? sortByDate(res.data) : []);
      })
      .catch((err) => {
        console.warn("Failed to fetch expenses:", err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
        }
        setExpenses([]);
      });
  }, [navigate]);

  // Reset form fields
  const resetForm = () => {
    setTitle("");
    setAmount("");
    setDate("");
    setEditingId(null);
  };

  // Handle Add or Update
  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token"); // use access_token

    if (!title || !amount || !date) return alert("Please fill all fields!");
    const headers = { Authorization: `Bearer ${token}` };

    if (editingId) {
      // --- Edit existing expense ---
      const updatedExpense = {
        expenseId: editingId,
        title,
        amount: parseFloat(amount),
        date,
      };

      axios
        .put(`${API_URL}/expenses/${editingId}`, updatedExpense, { headers })
        .then((res) => {
          setExpenses(
            sortByDate(
              expenses.map((exp) =>
                exp.expenseId === editingId ? res.data : exp
              )
            )
          );
          resetForm();
        })
        .catch((err) => {
          console.warn("Using local edit (API failed)", err.message);
          setExpenses(
            sortByDate(
              expenses.map((exp) =>
                exp.expenseId === editingId ? updatedExpense : exp
              )
            )
          );
          resetForm();
        });
    } else {
      // --- Add new expense ---
      const newExpense = { title, amount: parseFloat(amount), date };

      axios
        .post(`${API_URL}/expenses`, newExpense, { headers })
        .then((res) => {
          setExpenses(sortByDate([...expenses, res.data]));
          resetForm();
        })
        .catch((err) => {
          console.warn("Using local add (API failed)", err.message);
          setExpenses(
            sortByDate([
              ...expenses,
              { ...newExpense, expenseId: (expenses.length + 1).toString() },
            ])
          );
          resetForm();
        });
    }
  };

  // Handle Delete
  const deleteExpense = (expenseId) => {
    const token = localStorage.getItem("access_token"); // use access_token
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .delete(`${API_URL}/expenses/${expenseId}`, { headers })
      .then(() =>
        setExpenses(
          sortByDate(expenses.filter((exp) => exp.expenseId !== expenseId))
        )
      )
      .catch((err) => {
        console.warn("Using local delete (API failed)", err.message);
        setExpenses(
          sortByDate(expenses.filter((exp) => exp.expenseId !== expenseId))
        );
      });
  };

  // Handle Edit (prefill form)
  const editExpense = (expense) => {
    setTitle(expense.title);
    setAmount(expense.amount);
    setDate(expense.date.split("T")[0]);
    setEditingId(expense.expenseId);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("access_token"); // clear access_token
    navigate("/login");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Expenses</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded mr-2"
        >
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-400 text-white p-2 rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.expenseId}>
              <td className="border p-2">{exp.title}</td>
              <td className="border p-2">${Number(exp.amount).toFixed(2)}</td>
              <td className="border p-2">
                {new Date(exp.date).toLocaleDateString()}
              </td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => editExpense(exp)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteExpense(exp.expenseId)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {expenses.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-500">
                No expenses yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
