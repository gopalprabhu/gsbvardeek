import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    console.log("Login successful. Waiting for session...");

    // ✅ Just navigate now; don't loop
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (profileData) {
      navigate("/dashboard");
    } else {
      navigate("/create-profile");
    }
  };

  // ✅ Optional: clean up any old listeners
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {});
    return () => subscription.unsubscribe();
  }, []);

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
          ❤️ GSB Vardeek
        </h2>
        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            style={{
              background: "#f50057",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>

        <p style={{ marginTop: "15px", fontSize: "0.9rem", color: "#666" }}>
          Don’t have an account?{" "}
          <span
            style={{ color: "#f50057", cursor: "pointer", fontWeight: "bold" }}
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </motion.div>
    </div>
  );
}

const inputStyle = {
  border: "1px solid #ddd",
  borderRadius: "10px",
  padding: "12px 15px",
  fontSize: "1rem",
};
