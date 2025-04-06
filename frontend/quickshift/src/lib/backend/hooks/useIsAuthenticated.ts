import { useState, useEffect } from "react";
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // No need to redirect, just check authentication status
        const isAuthed = await BackendAPI.checkAuth(false); // Don't attempt refresh
        setIsAuthenticated(isAuthed);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isLoading };
};
