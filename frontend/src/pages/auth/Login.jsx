// src/pages/auth/Login.jsx

import { useState, useRef, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  // Eye tracking references
  const formRef = useRef(null);
  const robotRef = useRef(null);

  const [eyeDir, setEyeDir] = useState({ x: 0, y: 0 });

  // ⭐ Eye Tracking (moves only when field focused)
  useEffect(() => {
    if (!focusedField) {
      setEyeDir({ x: 0, y: 0 }); // reset eyes
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

  // Typing Logic
  function handleTyping(value) {
    setIsTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);

    typingTimer.current = setTimeout(() => setIsTyping(false), 500);
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    handleTyping(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(form.username, form.password);
      navigate("/resume");
    } catch {
      setError("Invalid username or password!");
    }
  };

  // ⭐ Eye Animations
  const eyeballAnim = { x: eyeDir.x };

  const pupilAnim =
    focusedField === "password"
      ? { y: 6, scaleY: 0.25, opacity: 0.45 } // close eyes during password focus
      : { x: eyeDir.x / 2, y: eyeDir.y, scaleY: 1, opacity: 1 };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#ECFFF4] px-4 py-10 md:px-10">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">

        {/* LEFT FORM */}
        <div ref={formRef} className="col-span-12 md:col-span-6 px-4 sm:px-6 md:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1E293B] mb-3">
            Welcome Back ✨
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-md">

            {/* USERNAME */}
            <div>
              <label className="text-sm text-gray-700">Username</label>
              <input
                value={form.username}
                onChange={handleChange("username")}
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter username"
                className="w-full p-3 mt-1 rounded-xl border border-[#C8F2DF] bg-white
                focus:ring-2 focus:ring-[#5CD6A4]"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="w-full p-3 mt-1 rounded-xl border border-[#C8F2DF] bg-white
                  focus:ring-2 focus:ring-[#5CD6A4]"
                />

                {/* SHOW/HIDE */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#2f9275]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="p-3 rounded-lg bg-red-100 text-red-700 text-sm border border-red-300">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="px-6 py-3 rounded-xl w-full bg-[#36A88A] hover:bg-[#2f9275]
              text-white font-semibold shadow-lg cursor-pointer"
            >
              Sign In
            </button>

            {/* REGISTER NAV */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-[#1E293B] hover:text-[#2f9275] font-semibold underline text-sm"
              >
                New user? Create an Account →
              </button>
            </div>

          </form>
        </div>

        {/* ROBOT */}
        <div className="col-span-12 md:col-span-6 flex justify-center mt-10 md:mt-0">

          <motion.div
            ref={robotRef}
            animate={{ scale: focusedField ? 1.02 : 1 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
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
                "linear-gradient(135deg, rgba(200,240,220,0.35) 0%, rgba(255,255,255,0.8) 100%)",
              boxShadow: "0 25px 60px rgba(80,160,130,0.25)",
            }}
          >

            {/* ORB */}
            <motion.div
              animate={focusedField ? { y: -15, scale: 1.09 } : { y: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="absolute top-6 sm:top-8 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#4C5A67]"
              style={{
                border: "6px solid rgba(70,215,150,0.4)",
                boxShadow: "0 20px 40px rgba(70,200,150,0.22)",
              }}
            />

            {/* HEAD */}
            <div className="relative w-40 h-32 sm:w-52 sm:h-40 bg-[#5D6A75] rounded-3xl shadow-xl">

              {/* EYES */}
              <div className="absolute top-6 sm:top-7 flex gap-6 sm:gap-10 w-full justify-center">
                {[1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={eyeballAnim}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden"
                  >
                    <motion.div
                      animate={pupilAnim}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="w-3 h-3 sm:w-4 sm:h-4 bg-[#0f172a] rounded-full"
                    />
                  </motion.div>
                ))}
              </div>

              {/* SMILE */}
              <motion.div
                animate={focusedField ? { scaleX: 1.2 } : { scaleX: 1 }}
                transition={{ duration: 0.4 }}
                className="absolute bottom-5 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-2 sm:h-3 rounded-full bg-[#0f172a]"
              />
            </div>

            {/* KEYBOARD (Improved Animation) */}
            <div className="absolute bottom-8 sm:bottom-10 w-48 sm:w-64 h-20 sm:h-28 bg-[#475569] rounded-xl shadow-lg flex items-end justify-center">
              <div className="flex gap-2 sm:gap-3 absolute bottom-5 sm:bottom-6">

                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={
                      isTyping
                        ? {
                            y: [-2, -14, 0],
                          }
                        : { y: 0 }
                    }
                    transition={{
                      duration: 0.28,
                      ease: "easeOut",
                      delay: i * 0.03, // small delay per key
                    }}
                    className="w-6 h-6 sm:w-8 sm:h-8 bg-[#606B78] rounded-md shadow"
                  />
                ))}

              </div>
            </div>

            {/* HANDS (same typing animation) */}
            <div className="absolute bottom-24 sm:bottom-32 flex gap-8 sm:gap-12 items-end">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  animate={
                    isTyping
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

      </div>
    </div>
  );
}
