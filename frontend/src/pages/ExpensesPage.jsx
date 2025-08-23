import { useEffect, useState } from "react";
import axios from "axios";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [editingId, setEditingId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  // Load expenses from backend (with fallback)
  useEffect(() => {
    axios.get(`${API_URL}/expenses`)
      .then(res => {
        console.log("API response:", res.data);
        setExpenses(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.warn("Backend not reachable, using mock data:", err.message);
        setExpenses([
          { id: 1, title: "Coffee", amount: 4.5, date: "2025-08-01" },
          { id: 2, title: "Groceries", amount: 52.3, date: "2025-08-15" },
          { id: 3, title: "Netflix", amount: 15.99, date: "2025-08-20" },
        ]);
      });
  }, []);

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

    if (!title || !amount || !date) return alert("Please fill all fields!");

    if (editingId) {
      // --- Edit existing expense ---
      const updatedExpense = { id: editingId, title, amount: parseFloat(amount), date };

      axios.put(`${API_URL}/expenses/${editingId}`, updatedExpense)
        .then(res => {
          setExpenses(expenses.map(exp => exp.id === editingId ? res.data : exp));
          resetForm();
        })
        .catch(err => {
          console.warn("Using local edit (API failed)", err.message);
          setExpenses(expenses.map(exp => exp.id === editingId ? updatedExpense : exp));
          resetForm();
        });
    } else {
      // --- Add new expense ---
      const newExpense = { title, amount: parseFloat(amount), date };

      axios.post(`${API_URL}/expenses`, newExpense)
        .then(res => {
          setExpenses([...expenses, res.data]);
          resetForm();
        })
        .catch(err => {
          console.warn("Using local add (API failed)", err.message);
          setExpenses([...expenses, { ...newExpense, id: expenses.length + 1 }]);
          resetForm();
        });
    }
  };

  // Handle Delete
  const deleteExpense = (id) => {
    axios.delete(`${API_URL}/expenses/${id}`)
      .then(() => setExpenses(expenses.filter(exp => exp.id !== id)))
      .catch(err => {
        console.warn("Using local delete (API failed)", err.message);
        setExpenses(expenses.filter(exp => exp.id !== id));
      });
  };

  // Handle Edit (prefill form)
  const editExpense = (expense) => {
    setTitle(expense.title);
    setAmount(expense.amount);
    setDate(expense.date.split("T")[0]);
    setEditingId(expense.id);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Expenses</h2>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mr-2">
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
          {expenses.map(exp => (
            <tr key={exp.id}>
              <td className="border p-2">{exp.title}</td>
              <td className="border p-2">${Number(exp.amount).toFixed(2)}</td>
              <td className="border p-2">{new Date(exp.date).toLocaleDateString()}</td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => editExpense(exp)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteExpense(exp.id)}
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