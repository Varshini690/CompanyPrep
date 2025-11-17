import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function ResumeUpload() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadResume = async () => {
    if (!file) return;

    let formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);

      const res = await api.post("/resume/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setParsed(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "35px",
        background: "#fff",
        borderRadius: "20px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
      }}
    >
      {/* Title */}
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
        style={{ textAlign: "center", marginBottom: "20px", color: "#0f8f48" }}
      >
        Upload Resume
      </motion.h1>

      {/* Upload Box */}
      <motion.label
        whileHover={{ scale: 1.03, rotate: 1 }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: "block",
          border: "2px dashed #0f8f48",
          padding: "25px",
          borderRadius: "14px",
          textAlign: "center",
          cursor: "pointer",
          background: "#f6fff8",
          transition: "0.3s",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: "10px", fontWeight: "600", color: "#0f8f48" }}
        >
          {file ? file.name : "Choose File"}
        </motion.div>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          style={{
            width: "100%",
            display: "none",
          }}
        />
      </motion.label>

      {/* Upload Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={uploadResume}
        disabled={!file || loading}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "14px",
          background: "#0f8f48",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: file ? "pointer" : "not-allowed",
          opacity: file ? 1 : 0.6,
          fontSize: "17px",
          fontWeight: "600",
          letterSpacing: "0.5px",
        }}
      >
        {loading ? "Processing..." : "Upload"}
      </motion.button>

      {/* Loader Animation */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: "30px",
            textAlign: "center",
            fontSize: "16px",
            color: "#0f8f48",
            fontWeight: "bold",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #0f8f48",
              borderTop: "4px solid transparent",
              borderRadius: "50%",
              margin: "0 auto 10px",
            }}
          ></motion.div>
          Extracting details…
        </motion.div>
      )}

      {/* Parsed Data */}
      {parsed && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginTop: "30px" }}
        >
          <motion.h2
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{ color: "#0f8f48" }}
          >
            Extracted Data:
          </motion.h2>

          <motion.pre
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              background: "#e9ffee",
              padding: "15px",
              borderRadius: "10px",
              maxHeight: "220px",
              overflow: "auto",
              boxShadow: "0 0 10px rgba(0,0,0,0.05)",
            }}
          >
            {JSON.stringify(parsed, null, 2)}
          </motion.pre>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/setup")}
            style={{
              marginTop: "25px",
              width: "100%",
              padding: "14px",
              background: "#12a154",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "17px",
              fontWeight: "600",
            }}
          >
            Continue → Generate Questions
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
