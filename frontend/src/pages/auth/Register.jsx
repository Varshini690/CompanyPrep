// src/pages/auth/Register.jsx
import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register/", form);
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button>Register</button>
      </form>
    </div>
  );
}
