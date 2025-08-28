import express from "express";
import { randomUUID } from "crypto";
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
import serverless from "serverless-http";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const app = express();

// DynamoDB setup
const client = new DynamoDBClient({ region: "us-east-1" });
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMO_TABLE || "ExpensesTable";

// Parse JSON
app.use(express.json());

// Middleware: strip API Gateway stage prefix 
app.use((req, res, next) => {
  const stage = "/default"; 
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

// Local dev server 
if (!process.env.AWS_EXECUTION_ENV) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}
