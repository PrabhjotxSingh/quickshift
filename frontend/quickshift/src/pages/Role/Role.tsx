import Topbar from "../Parts/Topbar/Topbar";
import "./Role.css";

export default function Role() {
  return (
    <>
      <Topbar />
      <div className="center-container">
        <div className="content">
          <h2>Please select a role to continue.</h2>
          <div className="role-selection">
            <div className="role-option">
              <img src="role_employer.jpg" alt="Employer" />
              <div className="role-text">Employer</div>
            </div>
            <div className="role-option">
              <img src="role_employee.jpg" alt="Employee" />
              <div className="role-text">Employee</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
