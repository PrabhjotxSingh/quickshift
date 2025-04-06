import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BackendAPI } from "../backend-api";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isAuthed = await BackendAPI.checkAuth();
        setIsAuthenticated(isAuthed);

        if (!isAuthed) {
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [navigate]);

  const logout = () => {
    BackendAPI.logout();
    setIsAuthenticated(false);
    navigate("/login");
  };

  return { isAuthenticated, isLoading, logout };
};
