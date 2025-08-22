const express = require("express");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Mock in-memory data
let expenses = [
  { id: 1, title: "Coffee", amount: 4.5, date: "2025-08-01" },
  { id: 2, title: "Groceries", amount: 52.3, date: "2025-08-15" },
  { id: 3, title: "Netflix", amount: 15.99, date: "2025-08-20" },
];

// Routes
app.get("/expenses", (req, res) => {
  res.json(expenses);
});

app.post("/expenses", (req, res) => {
  const newExpense = { id: Date.now(), ...req.body };
  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

app.delete("/expenses/:id", (req, res) => {
  const id = parseInt(req.params.id);
  expenses = expenses.filter((exp) => exp.id !== id);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});