import { Route, Routes } from "react-router-dom";
import "./App.css";
import Role from "./pages/Role/Role";
import Login from "./pages/Login/Login";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Role />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
