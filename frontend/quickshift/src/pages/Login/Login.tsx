import "./Login.css";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ACCESS_TOKEN_KEY, BackendAPI } from "../../lib/backend/backend-api";
import { useEffect, useState, useRef } from "react";
import { LoginRequest } from "../../backend-api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const initialCheckDone = useRef(false);

  // Check if user is already logged in
  useEffect(() => {
    if (initialCheckDone.current) return;
    initialCheckDone.current = true;
    
    const checkAuthAndRedirect = async () => {
      try {
        // First initialize the API
        console.log("Login page: Initializing API");
        BackendAPI.initialize();
        
        // Clear any existing login errors
        localStorage.removeItem('auth_error');
        
        // Check if there's a token in storage
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (!token) {
          console.log("Login page: No token found, staying on login page");
          return;
        }
        
        console.log("Login page: Token found, validating...");
        // First check without refresh to avoid unnecessary refresh attempts
        const initialCheck = await BackendAPI.checkAuth(false);
        
        if (initialCheck) {
          console.log("Login page: Valid token, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
        
        // If initial check fails, try with refresh
        console.log("Login page: Token may be expired, trying refresh...");
        const refreshCheck = await BackendAPI.checkAuth(true);
        
        if (refreshCheck) {
          console.log("Login page: Token refreshed successfully, redirecting to dashboard");
          navigate("/dashboard");
        } else {
          console.log("Login page: Token refresh failed, staying on login page");
          // Clear invalid tokens
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem('quickshift_refresh_token');
        }
      } catch (error) {
        console.error("Login page: Auth check error:", error);
      }
    };
    
    checkAuthAndRedirect();
  }, [navigate]);

  const handleLogin = async () => {
    // Validate input fields
    if (!email.trim() || !password.trim()) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please enter both email and password",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "swal2-black-button",
        },
      });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Login page: Attempting login with:", email);
      
      // Create login request
      const loginRequest: LoginRequest = {
        username: email,
        password: password,
      };
      
      // Call the login API
      await BackendAPI.login(loginRequest);
      
      // Double check we have a token
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        throw new Error("No token received after login");
      }

      console.log("Login page: Login successful, token:", token.substring(0, 10) + "...");
      
      // Make sure we reinitialize the API with the new token
      BackendAPI.initialize(token);
      
      // Small delay to ensure token is properly set before navigation
      setTimeout(() => {
        console.log("Login page: Redirecting to dashboard");
        navigate("/dashboard");
      }, 300);
    } catch (error) {
      console.error("Login page: Login failed:", error);
      
      let errorMessage = "Invalid email or password. Please try again.";
      if (error instanceof Error) {
        // Customize error message based on the error
        if (error.message.includes("Network Error")) {
          errorMessage = "Could not connect to the server. Please check your internet connection.";
        }
      }
      
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: errorMessage,
        footer: '<a href="/signup">Need an account? Sign up here</a>',
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "swal2-black-button",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-container"></div>
      <div className="center_page">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Welcome to QuickShift</CardTitle>
            <CardDescription>Login below to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link to="/signup">
              <Button variant="outline" disabled={loading}>Signup</Button>
            </Link>
            <Button onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
