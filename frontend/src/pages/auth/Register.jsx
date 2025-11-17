// src/pages/auth/Register.jsx
import { useState, useRef, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [focusedField, setFocusedField] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const typingTimer = useRef(null);

  const formRef = useRef(null);
  const robotRef = useRef(null);
  const [eyeDir, setEyeDir] = useState({ x: 0, y: 0 });

  const [isCelebrating, setIsCelebrating] = useState(false);

  const navigate = useNavigate();

  const handleFocus = (field) => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);

  /* ------------ Typing tracking -------------- */
  function handleTyping(value) {
    setIsTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setIsTyping(false), 400);
  }

  /* ------------ Password validation -------------- */
  function validatePassword(pwd) {
    if (!pwd) return "Password is required";
    if (pwd.length < 8) return "Password must be at least 8 characters";
    if (!/[0-9]/.test(pwd)) return "Password must contain a number";
    if (!/[A-Za-z]/.test(pwd)) return "Password must contain a letter";
    return "";
  }

  /* ------------ Form Change -------------- */
  const handleChange = (field) => (e) => {
    const value = e.target.value;

    setForm({ ...form, [field]: value });
    handleTyping(value);

    setFieldErrors({ ...fieldErrors, [field]: "" });

    if (field === "password") setPasswordError(validatePassword(value));
  };

  /* ------------ Form Submit -------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!form.username) newErrors.username = "Username is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    if (passwordError) newErrors.password = passwordError;

    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await api.post("/auth/register/", form);
      setIsCelebrating(true);

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.log(err);
    }
  };

  /* ------------ Eye Tracking (Fully responsive like Login) ------------ */
  useEffect(() => {
    if (!focusedField) {
      setEyeDir({ x: 0, y: 0 });
      return;
    }

    const updateEye = () => {
      if (!formRef.current || !robotRef.current) return;

      const formBox = formRef.current.getBoundingClientRect();
      const robotBox = robotRef.current.getBoundingClientRect();

      const formMid = {
        x: formBox.left + formBox.width / 2,
        y: formBox.top + formBox.height / 2,
      };

      const robotMid = {
        x: robotBox.left + robotBox.width / 2,
        y: robotBox.top + robotBox.height / 2,
      };

      const dx = (formMid.x - robotMid.x) / 10;
      const dy = (formMid.y - robotMid.y) / 15;

      const x = Math.max(-35, Math.min(35, dx));
      const y = Math.max(-10, Math.min(10, dy));

      setEyeDir({ x, y });
    };

    updateEye();
    window.addEventListener("resize", updateEye);
    return () => window.removeEventListener("resize", updateEye);
  }, [focusedField]);

  /* ------------ Eye + Pupil Animations ------------ */
  const eyeballAnim = { x: eyeDir.x };

  const pupilAnim =
    focusedField === "password"
      ? { y: 6, scaleY: 0.25, opacity: 0.45 }
      : { x: eyeDir.x / 2, y: eyeDir.y, scaleY: 1, opacity: 1 };

  /* ------------ Celebration Mode ------------ */
  const celebrationEyes = { scale: 1.3, y: -4 };
  const celebrationPupil = { scale: 1.4, y: -4 };
  const celebrationSmile = { scaleX: 1.6, y: -3 };
  const celebrationBounce = {
    y: [0, -25, 0, -15, 0],
    transition: { duration: 1, ease: "easeOut" },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#ECFFF4] px-4 py-10 md:px-10">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">

        {/* -------------------- ROBOT (LEFT) -------------------- */}
        <div className="col-span-12 md:col-span-6 flex justify-center">

          <motion.div
            ref={robotRef}
            animate={
              isCelebrating
                ? celebrationBounce
                : focusedField
                ? { scale: 1.03 }
                : { scale: 1 }
            }
            transition={{
              duration: isCelebrating ? 1 : 1.5,
              repeat: isCelebrating ? 0 : Infinity,
            }}
            className="
              relative
              w-[260px] h-[300px]
              sm:w-[300px] sm:h-[340px]
              md:w-[360px] md:h-[420px]
              lg:w-[400px] lg:h-[460px]
              rounded-3xl flex items-center justify-center
            "
            style={{
              background:
                "linear-gradient(135deg,rgba(200,240,220,0.35),rgba(255,255,255,0.8))",
              boxShadow: "0 25px 60px rgba(80,160,130,0.25)",
            }}
          >

            {/* ORB */}
            <motion.div
              animate={
                isCelebrating
                  ? { y: -25, scale: 1.2 }
                  : focusedField
                  ? { y: -15, scale: 1.1 }
                  : { y: 0, scale: 1 }
              }
              transition={{ duration: 0.4 }}
              className="absolute top-8 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#4C5A67]"
            />

            {/* HEAD */}
            <div className="relative w-40 h-32 sm:w-52 sm:h-40 bg-[#5D6A75] rounded-3xl shadow-xl">

              {/* EYES */}
              <div className="absolute top-7 flex gap-6 sm:gap-10 w-full justify-center">
                {[1, 2].map(() => (
                  <motion.div
                    animate={
                      isCelebrating ? celebrationEyes : eyeballAnim
                    }
                    transition={{ duration: 0.3 }}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden"
                  >
                    <motion.div
                      animate={
                        isCelebrating ? celebrationPupil : pupilAnim
                      }
                      transition={{ duration: 0.3 }}
                      className="w-3 h-3 sm:w-4 sm:h-4 bg-[#0f172a] rounded-full"
                    />
                  </motion.div>
                ))}
              </div>

              {/* SMILE */}
              <motion.div
                animate={
                  isCelebrating
                    ? celebrationSmile
                    : focusedField
                    ? { scaleX: 1.2 }
                    : { scaleX: 1 }
                }
                transition={{ duration: 0.3 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-2 sm:h-3 bg-[#0f172a] rounded-full"
              />
            </div>

            {/* KEYBOARD */}
            <div className="absolute bottom-6 sm:bottom-10 w-44 sm:w-56 h-16 sm:h-24 bg-[#475569] rounded-xl shadow-lg flex items-end justify-center">
              <div className="flex gap-2 sm:gap-3 absolute bottom-4 sm:bottom-6">

                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={
                      isCelebrating
                        ? { y: [-8, -25, 0] }
                        : isTyping
                        ? { y: [-2, -14, 0] }
                        : { y: 0 }
                    }
                    transition={{
                      duration: 0.28,
                      ease: "easeOut",
                      delay: i * 0.03,
                    }}
                    className="w-6 h-6 sm:w-8 sm:h-8 bg-[#606B78] rounded-md shadow"
                  />
                ))}

              </div>
            </div>

            {/* HANDS */}
            <div className="absolute bottom-20 sm:bottom-32 flex gap-8 sm:gap-12 items-end">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  animate={
                    isCelebrating
                      ? { y: [-5, -28, 0] }
                      : isTyping
                      ? { y: [-3, -18, 0] }
                      : { y: 0 }
                  }
                  transition={{ duration: 0.3 }}
                  className="w-10 h-14 sm:w-12 sm:h-16 bg-[#4F5B67] rounded-xl shadow-lg"
                />
              ))}
            </div>

          </motion.div>
        </div>

        {/* -------------------- FORM (RIGHT) -------------------- */}
        <div ref={formRef} className="col-span-12 md:col-span-6 px-4 sm:px-8">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md p-6 sm:p-10 rounded-3xl bg-white/70 backdrop-blur-xl shadow-xl border border-[#C8F2DF]"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] text-center mb-6">
              Create Account ✨
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Username */}
              <div>
                <label className="text-sm text-gray-700">Username</label>
                <input
                  placeholder="Enter username"
                  onChange={handleChange("username")}
                  onFocus={() => handleFocus("username")}
                  onBlur={handleBlur}
                  className="w-full p-3 mt-1 rounded-xl border border-[#C8F2DF] bg-white"
                />
                {fieldErrors.username && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-gray-700">Email</label>
                <input
                  placeholder="Enter email"
                  onChange={handleChange("email")}
                  onFocus={() => handleFocus("email")}
                  onBlur={handleBlur}
                  className="w-full p-3 mt-1 rounded-xl border border-[#C8F2DF] bg-white"
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    onChange={handleChange("password")}
                    onFocus={() => handleFocus("password")}
                    onBlur={handleBlur}
                    className="w-full p-3 mt-1 rounded-xl border border-[#C8F2DF] bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#2f9275]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
                )}
              </div>

              {/* Register button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                type="submit"
                className="w-full p-3 rounded-xl bg-[#36A88A] hover:bg-[#2f9275] text-white font-semibold shadow-lg"
              >
                Register
              </motion.button>

            </form>

            {/* Login link */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[#1E293B] hover:text-[#2f9275] underline font-semibold"
              >
                Already have an account? Login →
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
