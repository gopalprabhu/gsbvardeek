import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import ProfileForm from "../components/ProfileForm";
import { motion } from "framer-motion";

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) navigate("/login");
      else setUser(data.user);
    }
    getUser();
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f50057, #ff8a65)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px 20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          maxWidth: "650px",
        }}
      >
        {user ? (
          <ProfileForm
            user={user}
            onProfileCreated={() => navigate("/my-profile")}
          />
        ) : (
          <p style={{ color: "white", textAlign: "center" }}>Loading...</p>
        )}
      </motion.div>
    </div>
  );
}
