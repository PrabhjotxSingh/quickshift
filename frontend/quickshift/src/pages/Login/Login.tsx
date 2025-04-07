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
import { BackendAPI } from "../../lib/backend/backend-api";
import { useEffect, useState, useRef } from "react";
import { LoginRequest } from "../../backend-api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const initialCheckDone = useRef(false);

  useEffect(() => {
    // Prevent multiple initialization
    if (initialCheckDone.current) return;
    initialCheckDone.current = true;

    // Initialize API and check if already logged in
    const checkExistingAuth = async () => {
      BackendAPI.initialize();

      try {
        // Check for cookies first, then localStorage as fallback
        const isValid = await BackendAPI.checkAuth(false); // Check without refresh first
        if (isValid) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.log("Error checking authentication status:", error);
      }
    };

    checkExistingAuth();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const loginRequest: LoginRequest = {
        username: email,
        password: password,
      };
      const success = await BackendAPI.login(loginRequest);
      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Unable to log in!",
        footer: '<a href="/signup">Maybe you need to create an account?</a>',
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "swal2-black-button",
        },
      });
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
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link to="/signup">
              <Button variant="outline">Signup</Button>
            </Link>
            <Button onClick={handleLogin}>Login</Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
