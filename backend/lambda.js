// backend/lambda.js
import serverlessExpress from "@vendia/serverless-express";
import app from "./server.js";

// Export the Lambda handler
export const handler = serverlessExpress({ app });
