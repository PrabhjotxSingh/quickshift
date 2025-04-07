import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BackendAPI } from "../backend-api";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const authCheckCompleted = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Prevent checking on every render
    if (authCheckCompleted.current) return;

    const verifyAuth = async () => {
      try {
        console.log("Verifying authentication on", location.pathname);

        // First try to initialize from localStorage (for page refresh cases)
        const hasStoredTokens = BackendAPI.loadTokensFromStorage();
        if (hasStoredTokens) {
          console.log("Found stored tokens, attempting to restore session");
        }

        // First, check if BackendAPI thinks we're authenticated already
        if (BackendAPI.isAuthenticated) {
          console.log("BackendAPI reports we're already authenticated");
          setIsAuthenticated(true);
          setIsLoading(false);
          authCheckCompleted.current = true;
          return;
        }

        // Try a full auth check (cookies, memory tokens, localStorage)
        const isAuthed = await BackendAPI.checkAuth(false);
        console.log("Authentication check result:", isAuthed);
        setIsAuthenticated(isAuthed);

        if (!isAuthed) {
          console.log("Not authenticated, redirecting to login");
          // Don't redirect if we're already on the login page
          if (!["/login", "/signup"].includes(location.pathname)) {
            navigate("/login");
          }
        } else {
          console.log("Authenticated, allowing access");
          // If we're on the login page but authenticated, redirect to dashboard
          if (["/login", "/signup"].includes(location.pathname)) {
            navigate("/dashboard");
          }
        }
      } finally {
        setIsLoading(false);
        authCheckCompleted.current = true;
      }
    };

    verifyAuth();
  }, [navigate, location.pathname]);

  const logout = () => {
    BackendAPI.logout();
    setIsAuthenticated(false);
    authCheckCompleted.current = false; // Reset for next login
    navigate("/login");
  };

  return { isAuthenticated, isLoading, logout };
};
