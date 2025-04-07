import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BackendAPI } from "../backend-api";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const authCheckCompleted = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only run authentication check once
    if (authCheckCompleted.current) return;

    const verifyAuth = async () => {
      try {
        console.log("Verifying authentication...");
        // Explicitly set attemptRefresh to false to avoid potential loops
        const isAuthed = await BackendAPI.checkAuth(false);
        console.log("Authentication check result:", isAuthed);
        setIsAuthenticated(isAuthed);

        if (!isAuthed) {
          console.log("Not authenticated, redirecting to login");
          navigate("/login");
        } else {
          console.log("Authenticated, allowing access");
        }
      } finally {
        setIsLoading(false);
        authCheckCompleted.current = true;
      }
    };

    verifyAuth();
  }, [navigate]);

  const logout = () => {
    BackendAPI.logout();
    setIsAuthenticated(false);
    authCheckCompleted.current = false; // Reset for next login
    navigate("/login");
  };

  return { isAuthenticated, isLoading, logout };
};
