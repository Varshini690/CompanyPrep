// src/pages/Dashboard.jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { logout } = useContext(AuthContext);

  return (
    <div>
      <h1>Welcome to Dashboard 🎉</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
