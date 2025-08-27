import express from "express";
import { randomUUID } from "crypto";
import cors from "cors";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import { authMiddleware } from "./authMiddleware.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import serverless from "serverless-http"; // for Lambda

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const app = express();

// DynamoDB setup
const client = new DynamoDBClient({ region: "us-east-1" });
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMO_TABLE || "ExpensesTable";

// CORS setup
app.use(
  cors({
    origin: ["http://localhost:5173"], // later: add Netlify/Vercel domain here too
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Explicitly respond to OPTIONS preflight
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

app.use(express.json());

// Middleware: strip API Gateway stage prefix (e.g., "/default")
app.use((req, res, next) => {
  const stage = "/default"; // change if you deploy to a different stage
  if (req.url.startsWith(stage)) {
    req.url = req.url.slice(stage.length) || "/";
  }
  next();
});

/**
 * GET /expenses - Fetch expenses for the logged-in user
 */
app.get("/expenses", authMiddleware, async (req, res) => {
  try {
    const data = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": req.userId,
        },
      })
    );

    const items = (data.Items || []).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    res.json(items);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

/**
 * POST /expenses - Add a new expense
 */
app.post("/expenses", authMiddleware, async (req, res) => {
  try {
    const { title, amount, date, category } = req.body;
    if (!title || !amount || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const expenseId = randomUUID();
    const newExpense = {
      userId: req.userId,
      expenseId,
      title,
      amount: Number(amount),
      date,
      category: category || "Other",
    };

    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: newExpense,
      })
    );

    res.json(newExpense);
  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).json({ error: "Failed to add expense" });
  }
});

/**
 * PUT /expenses/:expenseId - Update expense
 */
app.put("/expenses/:expenseId", authMiddleware, async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { title, amount, date, category } = req.body;

    const result = await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { userId: req.userId, expenseId },
        UpdateExpression: "SET #t = :t, #a = :a, #d = :d, #c = :c",
        ExpressionAttributeNames: {
          "#t": "title",
          "#a": "amount",
          "#d": "date",
          "#c": "category",
        },
        ExpressionAttributeValues: {
          ":t": title,
          ":a": Number(amount),
          ":d": date,
          ":c": category || "Other",
        },
        ReturnValues: "ALL_NEW",
      })
    );

    if (!result.Attributes) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(result.Attributes);
  } catch (err) {
    console.error("Error updating expense:", err);
    res.status(500).json({ error: "Failed to update expense" });
  }
});

/**
 * DELETE /expenses/:expenseId - Delete expense
 */
app.delete("/expenses/:expenseId", authMiddleware, async (req, res) => {
  try {
    const { expenseId } = req.params;

    await ddb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { userId: req.userId, expenseId },
      })
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

// Lambda handler
export const handler = serverless(app);

// Local dev server (only if not running in Lambda)
if (!process.env.AWS_EXECUTION_ENV) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}
