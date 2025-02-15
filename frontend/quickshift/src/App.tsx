import { Route, Routes } from "react-router-dom";
import "./App.css";
import Role from "./pages/Role/Role";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Role />} />
      </Routes>
    </div>
  );
}

export default App;
