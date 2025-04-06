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
        const isAuthed = await BackendAPI.checkAuth();
        setIsAuthenticated(isAuthed);

        if (!isAuthed) {
          navigate("/login");
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
