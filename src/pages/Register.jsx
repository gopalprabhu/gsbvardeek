import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    if (data.user && !data.user.confirmed_at) {
      // 👇 Show a friendly message instead of logging in directly
      alert(
        "✅ Registration successful! Please check your email and click the verification link before logging in."
      );
      navigate("/login");
    } else {
      navigate("/create-profile");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f50057, #ff8a65)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#333",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: "white",
          padding: "40px 30px",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "400px",
          boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#f50057", marginBottom: "25px" }}>
          💍 Join GSB Vardeek
        </h2>

        <form
          onSubmit={handleRegister}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "12px 15px",
              fontSize: "1rem",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "12px 15px",
              fontSize: "1rem",
            }}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            style={{
              background: "#ff8a65",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            {loading ? "Registering..." : "Create Account"}
          </motion.button>
        </form>

        <p style={{ marginTop: "15px", fontSize: "0.9rem", color: "#666" }}>
          Already have an account?{" "}
          <span
            style={{ color: "#f50057", cursor: "pointer", fontWeight: "bold" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
}
