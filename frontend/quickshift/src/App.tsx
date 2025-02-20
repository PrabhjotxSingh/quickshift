// src/App.tsx
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Role from "./pages/Role/Role";
import Login from "./pages/Login/Login";
import EmployerDashboard from "./pages/Dashboard/EmployerDashboard/EmployerDashboard";
import EmployeeDashboard from "./pages/Dashboard/EmployeeDashboard/EmployeeDashboard";
import PaymentSettings from "./pages/PaymentSettings/PaymentSettings";
import ShiftManagement from "./pages/Shifts/ShiftManagement/ShiftManagement";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Role />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard-employer" element={<EmployerDashboard />} />
        <Route path="/dashboard-employee" element={<EmployeeDashboard />} />
        <Route path="/payment" element={<PaymentSettings />} />
        <Route path="/shifts" element={<ShiftManagement />} />
      </Routes>
    </div>
  );
}

export default App;
