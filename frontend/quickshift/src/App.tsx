import { Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login/Login";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
