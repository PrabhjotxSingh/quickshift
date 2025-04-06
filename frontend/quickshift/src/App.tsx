import { Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Signup from "./pages/Signup/Signup";
import { AuthenticatedRoute } from "./components/auth/ProtectedRoute";
import { useEffect } from "react";
import { BackendAPI } from "./lib/backend/backend-api";

function App() {
  // Initialize backend API on app startup
  useEffect(() => {
    BackendAPI.initialize();
  }, []);

  return (
    <div className="">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <AuthenticatedRoute>
              <Dashboard />
            </AuthenticatedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
