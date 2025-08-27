import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Other");
  const [editingId, setEditingId] = useState(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  const sortByDate = (items) =>
    [...items].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Load expenses
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    axios
      .get(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setExpenses(Array.isArray(res.data) ? sortByDate(res.data) : []);
      })
      .catch((err) => {
        toast.error("Failed to fetch expenses");
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
        }
        setExpenses([]);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setDate("");
    setCategory("Other");
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!title || !amount || !date) {
      toast.error("Please fill all fields!");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);

    if (editingId) {
      const updatedExpense = { title, amount: parseFloat(amount), date, category };
        axios.put(`${API_URL}/expenses/${editingId}`, updatedExpense, { headers })
        .then((res) => {
          setExpenses(
            sortByDate(
              expenses.map((exp) => (exp.expenseId === editingId ? res.data : exp))
            )
          );
          toast.success("Expense updated!");
          resetForm();
        })
        .catch(() => {
          toast.error("Failed to update expense (using fallback)");
          setExpenses(
            sortByDate(
              expenses.map((exp) => (exp.expenseId === editingId ? updatedExpense : exp))
            )
          );
          resetForm();
        })
        .finally(() => setLoading(false));
    } else {
      const newExpense = { title, amount: parseFloat(amount), date, category };
      axios
        .post(`${API_URL}/expenses`, newExpense, { headers })
        .then((res) => {
          setExpenses(sortByDate([...expenses, res.data]));
          toast.success("Expense added!");
          resetForm();
        })
        .catch(() => {
          toast.error("Failed to add expense (using fallback)");
          setExpenses(
            sortByDate([
              ...expenses,
              { ...newExpense, expenseId: (expenses.length + 1).toString() },
            ])
          );
          resetForm();
        })
        .finally(() => setLoading(false));
    }
  };

  const deleteExpense = (expenseId) => {
    const token = localStorage.getItem("access_token");
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    axios
      .delete(`${API_URL}/expenses/${expenseId}`, { headers })
      .then(() => {
        setExpenses(expenses.filter((exp) => exp.expenseId !== expenseId));
        toast.success("Expense deleted!");
      })
      .catch(() => {
        setExpenses(expenses.filter((exp) => exp.expenseId !== expenseId));
        toast.error("Failed to delete expense (removed locally)");
      })
      .finally(() => setLoading(false));
  };

  const editExpense = (expense) => {
    setTitle(expense.title);
    setAmount(expense.amount);
    setDate(expense.date.split("T")[0]);
    setCategory(expense.category || "Other");
    setEditingId(expense.expenseId);
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchCategory = filterCategory ? exp.category === filterCategory : true;
    const matchFrom = filterFrom ? new Date(exp.date) >= new Date(filterFrom) : true;
    const matchTo = filterTo ? new Date(exp.date) <= new Date(filterTo) : true;
    return matchCategory && matchFrom && matchTo;
  });

  const total = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Expenses</h2>

      {/* Show spinner */}
      {loading && <p className="text-gray-500 mb-4">Loading...</p>}

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option>Food</option>
          <option>Transport</option>
          <option>Rent</option>
          <option>Shopping</option>
          <option>Other</option>
        </select>
        <div className="flex space-x-2">
          <button type="submit" className="bg-blue-500 text-white px-3 py-2 rounded w-full">
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-400 text-white px-3 py-2 rounded w-full"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          <option>Food</option>
          <option>Transport</option>
          <option>Rent</option>
          <option>Shopping</option>
          <option>Other</option>
        </select>
        <input
          type="date"
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Total */}
      <p className="text-lg font-bold mb-2 text-blue-600">
        Total: ${total.toFixed(2)}
      </p>

      {/* Table */}
      <table className="w-full border rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.map((exp, i) => (
            <tr key={exp.expenseId} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="border p-2">{exp.title}</td>
              <td className="border p-2">{exp.category || "Other"}</td>
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
          {filteredExpenses.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500">
                No expenses yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
