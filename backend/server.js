import express from "express";
import { randomUUID } from "crypto";
import cors from "cors";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import { authMiddleware } from "./authMiddleware.js";
import dotenv from "dotenv";

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5001;

// DynamoDB setup
const client = new DynamoDBClient({ region: "us-east-1" });
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMO_TABLE || "ExpensesTable";

app.use(cors());
app.use(express.json());


// Routes
app.get("/expenses", authMiddleware, async (req, res) => {
  try {
    const data = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));
    const items = (data.Items || []).sort(
      (a, b) => new Date(b.date) - new Date(a.date) // newest first
    );
    res.json(items);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

app.post("/expenses", authMiddleware, async (req, res) => {
  try {
    const { title, amount, date } = req.body;
    if (!title || !amount || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const expenseId = randomUUID(); // Randomized ID
    const newExpense = { expenseId, title, amount: Number(amount), date };

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

app.put("/expenses/:expenseId", async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { title, amount, date } = req.body;

    const result = await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { expenseId },
        UpdateExpression: "set title = :t, amount = :a, date = :d",
        ExpressionAttributeValues: {
          ":t": title,
          ":a": Number(amount),
          ":d": date,
        },
        ReturnValues: "ALL_NEW",
      })
    );

    res.json(result.Attributes);
  } catch (err) {
    console.error("Error updating expense:", err);
    res.status(500).json({ error: "Failed to update expense" });
  }
});

app.delete("/expenses/:expenseId", async (req, res) => {
  try {
    const { expenseId } = req.params;

    await ddb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { expenseId },
      })
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
