import { useState, useContext } from "react";
import Select from "react-select";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { jobRoles } from "../data/jobRoles";
import { companies } from "../data/companies";

export default function InterviewSetup() {
  const { token } = useContext(AuthContext);

  const [form, setForm] = useState({
    job_role: "",
    company: "",
    difficulty: "",
    interview_type: "",
    rounds: 1,
  });

  const [questions, setQuestions] = useState([]);

  const roleOptions = jobRoles.map((r) => ({ value: r, label: r }));
  const companyOptions = companies.map((c) => ({ value: c, label: c }));

  const handleSubmit = async () => {
    try {
      const res = await api.post(
        "/interview/setup/",
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setQuestions(res.data.questions);
      alert("Interview Setup Saved!");
    } catch (err) {
      alert("Setup failed. Please upload resume first.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
        lineHeight: "1.6",
        textAlign: "center"
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Interview Setup</h1>

      {/* Job Role */}
      <Select
        options={roleOptions}
        placeholder="Search or select job role"
        onChange={(selected) => setForm({ ...form, job_role: selected.value })}
      />

      {/* Company */}
      <div style={{ marginTop: "10px" }}>
        <Select
          options={companyOptions}
          placeholder="Search company"
          onChange={(selected) => setForm({ ...form, company: selected.value })}
        />
      </div>

      {/* Difficulty */}
      <div style={{ marginTop: "10px" }}>
        <select
          style={{ width: "100%", padding: "10px" }}
          value={form.difficulty}
          onChange={(e) =>
            setForm({ ...form, difficulty: e.target.value })
          }
        >
          <option value="">Select Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Interview Type */}
      <div style={{ marginTop: "10px" }}>
        <select
          style={{ width: "100%", padding: "10px" }}
          value={form.interview_type}
          onChange={(e) =>
            setForm({ ...form, interview_type: e.target.value })
          }
        >
          <option value="">Select Type</option>
          <option value="Technical">Technical</option>
          <option value="HR">HR</option>
          <option value="Behavioral">Behavioral</option>
          <option value="System Design">System Design</option>
        </select>
      </div>

      {/* Rounds */}
      <div style={{ marginTop: "10px" }}>
        <input
          type="number"
          min="1"
          max="5"
          value={form.rounds}
          placeholder="Rounds"
          style={{ width: "100%", padding: "10px" }}
          onChange={(e) => setForm({ ...form, rounds: e.target.value })}
        />
      </div>

      {/* Submit Button */}
      <button
        style={{
          marginTop: "15px",
          padding: "10px",
          width: "100%",
          background: "#4A4AFF",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
        onClick={handleSubmit}
      >
        Save & Generate Questions
      </button>

      {/* Questions */}
      {questions.length > 0 && (
        <div
          style={{
            marginTop: "30px",
            background: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h3>AI Generated Questions:</h3>
          {questions.map((q, idx) => (
            <p key={idx}>
              <strong>{idx + 1}.</strong> {q}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
