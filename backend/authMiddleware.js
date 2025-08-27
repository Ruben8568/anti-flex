// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import axios from "axios";

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

let pems; // cached keys

// backend/middleware/authMiddleware.js
// ... keep your existing imports

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Malformed authorization header" });
    }

    const region = process.env.COGNITO_REGION;
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    if (!pems) {
      const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
      const { data } = await axios.get(jwksUrl);
      pems = {};
      data.keys.forEach((key) => {
        pems[key.kid] = jwkToPem(key);
      });
    }

    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || !decodedHeader.header.kid) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const pem = pems[decodedHeader.header.kid];
    if (!pem) {
      return res.status(401).json({ message: "Invalid signing key" });
    }

    jwt.verify(token, pem, { algorithms: ["RS256"] }, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token verification failed" });
      }

      if (decoded.token_use !== "access") {
        return res.status(401).json({ message: "Not an access token" });
      }

      // ✅ Attach userId (Cognito sub)
      req.userId = decoded.sub;
      req.user = decoded;

      next();
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
}
