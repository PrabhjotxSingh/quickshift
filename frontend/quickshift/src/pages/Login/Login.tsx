import { useState } from "react";
import Topbar from "../Parts/Topbar/Topbar";
import "./Login.css";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <>
      <Topbar />
      <div className="center-container">
        <div className={`form-container ${isLogin ? "" : "slide-left"}`}>
          <div className="form-content login-form">
            <h2>Login</h2>
            <form>
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <button type="submit">Login</button>
            </form>
            <p>
              Don't have an account?{" "}
              <span className="toggle-link" onClick={toggleForm}>
                Sign Up
              </span>
            </p>
          </div>

          <div className="form-content signup-form">
            <h2>Sign Up</h2>
            <form>
              <input type="text" placeholder="Full Name" required />
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <button type="submit">Sign Up</button>
            </form>
            <p>
              Already have an account?{" "}
              <span className="toggle-link" onClick={toggleForm}>
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
