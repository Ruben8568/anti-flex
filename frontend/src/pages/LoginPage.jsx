import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const REGION = import.meta.env.VITE_COGNITO_REGION;
  const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `https://cognito-idp.${REGION}.amazonaws.com/`,
        {
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: CLIENT_ID,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
          },
        },
        {
          headers: {
            "Content-Type": "application/x-amz-json-1.1",
            "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
          },
        }
      );

      const authResult = response.data.AuthenticationResult;

      // Store all tokens
      localStorage.setItem("access_token", authResult.AccessToken);
      localStorage.setItem("id_token", authResult.IdToken);
      localStorage.setItem("refresh_token", authResult.RefreshToken);

      navigate("/expenses");
    } catch (err) {
      console.error("Login failed", err.response?.data || err.message);
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
