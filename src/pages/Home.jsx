import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";

export default function Home() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    }
    checkUser();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f50057, #ff8a65)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        textAlign: "center",
        padding: "0 20px",
      }}
    >
      {/* App Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "10px",
          letterSpacing: "1px",
        }}
      >
        💍 GSB Matrimony
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
        style={{
          fontSize: "1.1rem",
          maxWidth: "420px",
          margin: "0 auto 25px",
          lineHeight: "1.6",
        }}
      >
        Find your perfect match within the GSB community. 100% verified
        profiles. Real connections. Trusted network.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "40px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {session ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            style={{
              background: "#fff",
              color: "#f50057",
              border: "none",
              borderRadius: "25px",
              padding: "12px 30px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            }}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard 🚀
          </motion.button>
        ) : (
          <>
            <Link to="/register" style={{ textDecoration: "none" }}>
              <motion.button
                whileTap={{ scale: 0.9 }}
                style={{
                  background: "#fff",
                  color: "#f50057",
                  border: "none",
                  borderRadius: "25px",
                  padding: "12px 30px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                }}
              >
                Join Now 💖
              </motion.button>
            </Link>

            <Link to="/login" style={{ textDecoration: "none" }}>
              <motion.button
                whileTap={{ scale: 0.9 }}
                style={{
                  background: "transparent",
                  color: "#fff",
                  border: "2px solid #fff",
                  borderRadius: "25px",
                  padding: "12px 30px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Login
              </motion.button>
            </Link>
          </>
        )}
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        style={{
          background: "rgba(255,255,255,0.1)",
          padding: "25px 20px",
          borderRadius: "20px",
          maxWidth: "700px",
          boxShadow: "0 6px 25px rgba(0,0,0,0.2)",
          backdropFilter: "blur(8px)",
        }}
      >
        <h3 style={{ marginBottom: "15px", fontSize: "1.4rem" }}>
          Why Choose GSB Matrimony?
        </h3>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            lineHeight: "1.8",
            fontSize: "1rem",
          }}
        >
          <li>🌸 Exclusive for GSB Community</li>
          <li>💬 Real-time Chat & Smart Matching</li>
          <li>🔒 Secure, Verified & Private</li>
          <li>💖 </li>
        </ul>
      </motion.div>

      {/* Footer */}
      <p
        style={{
          marginTop: "40px",
          opacity: 0.8,
          fontSize: "0.9rem",
        }}
      >
        © {new Date().getFullYear()} GSB Matrimony. All rights reserved.
      </p>
    </div>
  );
}
