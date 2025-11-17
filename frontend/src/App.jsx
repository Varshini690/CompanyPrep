// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";


import ResumeUpload from "./pages/ResumeUpload";
import InterviewSetup from "./pages/InterviewSetup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* DEFAULT ROUTE: Redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/resume" element={<ResumeUpload />} />
        <Route path="/setup" element={<InterviewSetup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
