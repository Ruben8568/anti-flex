import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [viewMode, setViewMode] = useState("monthly");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [filterCategory, setFilterCategory] = useState(""); 

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#6366f1", "#22c55e", "#a855f7"];

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }
    axios
      .get(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setExpenses(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
        }
        setExpenses([]);
      });
  }, [navigate, API_URL]);

  // --- helpers ---
  const toMoney = (n) => Number(n || 0);

  const monthStart = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
  const weekStartMon = (d) => {
    const x = new Date(d);
    const day = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - day);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const dayStart = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };

  const groupBy = (items, keyFn, labelFn) => {
    const map = new Map();
    for (const e of items) {
      const d = new Date(e.date);
      const kDate = keyFn(d);
      const k = kDate.getTime();
      const curr = map.get(k) || { label: labelFn(kDate), total: 0, sortKey: k };
      curr.total += toMoney(e.amount);
      map.set(k, curr);
    }
    return Array.from(map.values())
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ label, total }) => ({ name: label, total }));
  };

  // apply category filter first
  const scopedExpenses = useMemo(() => {
    return filterCategory
      ? expenses.filter((e) => (e.category || "Other") === filterCategory)
      : expenses;
  }, [expenses, filterCategory]);

  // data for bar chart
  const barData = useMemo(() => {
    if (viewMode === "monthly") {
      return groupBy(
        scopedExpenses,
        (d) => monthStart(d),
        (d) => d.toLocaleString("default", { month: "short", year: "numeric" })
      );
    }
    if (viewMode === "weekly") {
      return groupBy(
        scopedExpenses,
        (d) => weekStartMon(d),
        (d) => `Week of ${d.toLocaleDateString()}`
      );
    }
    if (!rangeFrom || !rangeTo) return [];
    const from = dayStart(new Date(rangeFrom));
    const to = dayStart(new Date(rangeTo));
    const inRange = scopedExpenses.filter((e) => {
      const d = dayStart(new Date(e.date));
      return d >= from && d <= to;
    });
    return groupBy(inRange, (d) => dayStart(d), (d) => d.toLocaleDateString());
  }, [scopedExpenses, viewMode, rangeFrom, rangeTo]);

  // pie chart uses same scope
  const categoryData = useMemo(() => {
    const m = new Map();
    for (const e of scopedExpenses) {
      const cat = e.category || "Other";
      m.set(cat, (m.get(cat) || 0) + toMoney(e.amount));
    }
    return Array.from(m.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [scopedExpenses]);

  const totalThisMonth = useMemo(() => {
    const now = new Date();
    return scopedExpenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, e) => sum + toMoney(e.amount), 0);
  }, [scopedExpenses]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

      {/* controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="range">Custom Range</option>
        </select>

        {viewMode === "range" && (
          <>
            <input
              type="date"
              value={rangeFrom}
              onChange={(e) => setRangeFrom(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="date"
              value={rangeTo}
              onChange={(e) => setRangeTo(e.target.value)}
              className="border p-2 rounded"
            />
            <button
              type="button"
              onClick={() => { setRangeFrom(""); setRangeTo(""); }}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              Clear
            </button>
          </>
        )}

        {/* ✅ Category filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border p-2 rounded ml-2"
        >
          <option value="">All Categories</option>
          <option>Food</option>
          <option>Transport</option>
          <option>Rent</option>
          <option>Shopping</option>
          <option>Other</option>
        </select>

        <div className="ml-auto text-blue-600 font-semibold">
          This month: ${totalThisMonth.toFixed(2)}
        </div>
      </div>

      {/* charts (unchanged) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="p-4 border rounded shadow bg-white">
          <h3 className="text-lg font-semibold mb-2">
            {viewMode === "monthly" && "Expenses by Month"}
            {viewMode === "weekly" && "Expenses by Week (Mon–Sun)"}
            {viewMode === "range" && "Expenses by Day (Selected Range)"}
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="p-4 border rounded shadow bg-white">
          <h3 className="text-lg font-semibold mb-2">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
