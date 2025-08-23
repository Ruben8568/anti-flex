import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5001;


app.use(cors());
app.use(express.json());

// Mock in-memory data
let expenses = [
  { id: 1, title: "Coffee-Backend-Mock", amount: 4.5, date: "2025-08-01" },
  { id: 2, title: "Groceries-Backend-Mock", amount: 52.3, date: "2025-08-15" },
  { id: 3, title: "Netflix-Backend-Mock", amount: 15.99, date: "2025-08-20" },
];

// Routes
app.get("/expenses", (req, res) => {
  res.json(expenses);
});

app.post("/expenses", (req, res) => {
  const { title, amount, date } = req.body;
  const newExpense = {
    id: expenses.length ? expenses[expenses.length - 1].id + 1 : 1,
    title,
    amount,
    date,
  };
  expenses.push(newExpense);
  res.json(newExpense);
});

app.put("/expenses/:id", (req, res) => {
  const { id } = req.params;
  const { title, amount, date } = req.body;

  const expenseIndex = expenses.findIndex((exp) => exp.id == id);
  if (expenseIndex === -1) {
    return res.status(404).json({ error: "Expense not found" });
  }

  expenses[expenseIndex] = {
    ...expenses[expenseIndex],
    title,
    amount,
    date,
  };

  res.json(expenses[expenseIndex]);
});

app.delete("/expenses/:id", (req, res) => {
  const { id } = req.params;
  expenses = expenses.filter((exp) => exp.id != id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});