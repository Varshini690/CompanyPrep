import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function ResumeUpload() {
  const { token } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);

  const uploadResume = async () => {
    if (!file) return alert("Please upload a resume");

    let formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await api.post("/resume/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setParsed(res.data.data);
      alert("Uploaded & parsed successfully!");
    } catch (err) {
      console.log(err);
      alert("Upload failed");
    }
  };

  return (
    <div>
      <h1>Upload Resume</h1>

      <input 
        type="file" 
        accept=".pdf,.doc,.docx"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={uploadResume}>Upload</button>

      {parsed && (
        <div style={{ marginTop: "20px" }}>
          <h2>Extracted Data:</h2>
          <pre>{JSON.stringify(parsed, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
