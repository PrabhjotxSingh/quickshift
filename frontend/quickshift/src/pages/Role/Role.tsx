// src/pages/Role/Role.tsx
import { useNavigate } from "react-router-dom";
import Topbar from "../Parts/Topbar/Topbar";
import { useAuth } from "../../context/AuthContext";
import "./Role.css";

export default function Role() {
  const navigate = useNavigate();
  const { setRole } = useAuth();

  const handleSelectRole = (role: "employer" | "employee") => {
    setRole(role);
    if (role === "employer") {
      navigate("/dashboard-employer");
    } else {
      navigate("/dashboard-employee");
    }
  };

  return (
    <>
      <Topbar />
      <div className="center-container">
        <div className="content">
          <h2>Please select a role to continue.</h2>
          <div className="role-selection">
            <div
              className="role-option"
              onClick={() => handleSelectRole("employer")}
            >
              <img src="role_employer.jpg" alt="Employer" />
              <div className="role-text">Employer</div>
            </div>
            <div
              className="role-option"
              onClick={() => handleSelectRole("employee")}
            >
              <img src="role_employee.jpg" alt="Employee" />
              <div className="role-text">Employee</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
