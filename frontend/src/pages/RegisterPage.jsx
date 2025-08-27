import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [step, setStep] = useState("register"); // register → confirm
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const REGION = import.meta.env.VITE_COGNITO_REGION;
  const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;

  // --- Handle signup ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await axios.post(
        `https://cognito-idp.${REGION}.amazonaws.com/`,
        {
          ClientId: CLIENT_ID,
          Username: email,
          Password: password,
          UserAttributes: [{ Name: "email", Value: email }],
        },
        {
          headers: {
            "Content-Type": "application/x-amz-json-1.1",
            "X-Amz-Target": "AWSCognitoIdentityProviderService.SignUp",
          },
        }
      );

      setStep("confirm");
      setMessage("A confirmation code was sent to your email.");
    } catch (err) {
      console.error("Register failed", err.response?.data || err.message);
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  // --- Handle confirmation ---
  const handleConfirm = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await axios.post(
        `https://cognito-idp.${REGION}.amazonaws.com/`,
        {
          ClientId: CLIENT_ID,
          Username: email,
          ConfirmationCode: confirmationCode,
        },
        {
          headers: {
            "Content-Type": "application/x-amz-json-1.1",
            "X-Amz-Target": "AWSCognitoIdentityProviderService.ConfirmSignUp",
          },
        }
      );

      setMessage("Registration confirmed! Please log in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Confirm failed", err.response?.data || err.message);
      setError(err.response?.data?.message || "Confirmation failed.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={step === "register" ? handleRegister : handleConfirm}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md"
      >
        <img
          src="/images/cat-signup.png"
          alt="cat register"
          className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl mx-auto h-auto"
        />
        <h2 className="text-2xl font-bold mb-6 text-center">
          {step === "register" ? "Register" : "Confirm Registration"}
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}
        {message && (
          <p className="text-green-600 text-sm mb-4 text-center">{message}</p>
        )}

        {/* Step 1: Register */}
        {step === "register" && (
          <>
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
              placeholder="Password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 mb-4 rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Register
            </button>
          </>
        )}

        {/* Step 2: Confirm */}
        {step === "confirm" && (
          <>
            <input
              type="text"
              placeholder="Confirmation Code"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className="w-full border p-2 mb-4 rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Confirm
            </button>
          </>
        )}
      </form>
    </div>
  );
}
