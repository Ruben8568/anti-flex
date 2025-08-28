import express from "express";
import cors from "cors";

const app = express();

// Allow Amplify frontend to call API
app.use(
  cors({
    origin: "https://main.dzog8laldik5l.amplifyapp.com", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight OPTIONS requests
app.options("*", cors());

// existing middleware
app.use(express.json());

// ... your existing routes here

export default app;
