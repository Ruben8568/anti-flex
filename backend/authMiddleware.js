import axios from "axios";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";

const region = "us-east-1"; // your Cognito pool region
const userPoolId = "us-east-1_5gXfVTSQA"; // replace with your actual pool ID

let pems = null;

async function getPems() {
  if (pems) return pems;

  const url = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
  const { data } = await axios.get(url);

  pems = {};
  data.keys.forEach((key) => {
    pems[key.kid] = jwkToPem(key);
  });

  return pems;
}

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    const decodedJwt = jwt.decode(token, { complete: true });
    if (!decodedJwt) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const pems = await getPems();
    const pem = pems[decodedJwt.header.kid];
    if (!pem) {
      return res.status(401).json({ message: "Invalid token kid" });
    }

    const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

    jwt.verify(token, pem, { algorithms: ["RS256"], issuer }, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Token verification failed", error: err.message });
      }

      if (decoded.token_use !== "access") {
        return res.status(401).json({ message: "Not an access token" });
      }

      req.userId = decoded.sub;
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};
