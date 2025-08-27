import { BrowserRouter, Routes, Route } from "react-router-dom";
import ExpensesPage from "./pages/ExpensesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage"; // ✅ Import RegisterPage
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";

function Home() {
  return (
    <div className="text-center max-w-2xl mx-auto mt-12">
      <img
  src="/images/cat-cash.png"
  alt="Cash Cat"
  className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl mx-auto h-auto"
/>
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to Anti-Flex</h1>
      <p className="text-gray-700 text-lg mb-6">
        Anti-Flex helps you take control of your finances by tracking expenses,
        visualizing spending habits, and making smarter budgeting decisions. 
      </p>
    </div>
  );
}


function About() {
  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded shadow">
            <img
  src="/images/cat-chart.png"
  alt="Cash Cat"
  className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl mx-auto h-auto"
/>
      <h2 className="text-3xl font-bold text-blue-600 mb-4">About Anti-Flex</h2>
      <p className="text-gray-700 mb-4">
        Anti-Flex is a personal finance tracker designed to help you stop overspending
        and start making informed financial decisions. We believe managing money should
        be simple, secure, and accessible to everyone.
      </p>

      <h3 className="text-xl font-semibold mb-2"> Features</h3>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li>Track your daily expenses with categories</li>
        <li>Filter and search by date ranges and spending type</li>
        <li>Visualize your finances with bar and pie charts</li>
        <li>Secure authentication powered by AWS Cognito</li>
        <li>Data stored safely in DynamoDB on AWS</li>
      </ul>

      <h3 className="text-xl font-semibold mb-2"> Built With</h3>
      <p className="text-gray-700">
        React + Tailwind (Frontend) · Node.js + Express (Backend) · AWS Cognito
        (Authentication) · DynamoDB (Database)
      </p>
    </div>
  );
}

function NotFound() {
  return <h2>404 - Page Not Found</h2>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}

function Shell() {

  return (
    <>
      <header>
        <Navbar />
      </header>

      <main className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> {/* New route */}
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <ExpensesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="text-center py-4 text-gray-500">
        <p>© {new Date().getFullYear()} Anti-Flex. All rights reserved.</p>
      </footer>
    </>
  );
}
