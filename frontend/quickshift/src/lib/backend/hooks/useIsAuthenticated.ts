import { useState, useEffect, useRef } from "react";
import { BackendAPI } from "../backend-api";

/**
 * A simple hook that returns the current authentication state
 * without enforcing redirects. Use this for UI conditionals or
 * in public routes that need to know the authentication state.
 */
export const useIsAuthenticated = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    BackendAPI.isAuthenticated
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const checkCompleted = useRef(false);

  useEffect(() => {
    // Only run once per component instance
    if (checkCompleted.current) return;

    const checkAuth = async () => {
      try {
        // First try to load from localStorage on initial render
        if (!BackendAPI.isAuthenticated) {
          const hasStoredTokens = BackendAPI.loadTokensFromStorage();
          if (hasStoredTokens) {
            console.log("useIsAuthenticated: Found stored tokens");
          }
        }

        // Check if BackendAPI has an in-memory authentication state
        if (BackendAPI.isAuthenticated) {
          console.log("BackendAPI already reports authenticated");
          setIsAuthenticated(true);
          setIsLoading(false);
          checkCompleted.current = true;
          return;
        }

        // Skip refresh to avoid loops
        const isAuthed = await BackendAPI.checkAuth(false);
        console.log("useIsAuthenticated check result:", isAuthed);
        setIsAuthenticated(isAuthed);
      } finally {
        setIsLoading(false);
        checkCompleted.current = true;
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isLoading };
};
