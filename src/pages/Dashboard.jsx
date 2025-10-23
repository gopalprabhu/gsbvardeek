import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import ProfileForm from "../components/ProfileForm";
import SwipeDeck from "../components/SwipeDeck";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [myProfile, setMyProfile] = useState(null);
  const [view, setView] = useState("menu"); // menu | profile | swipe
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // 🧱 Load profile once user is available
  useEffect(() => {
    async function getProfile() {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) console.error("Profile fetch error:", error);
      setMyProfile(data);
    }
    getProfile();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // 🕐 Show loading screen while context is restoring
  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #f50057, #ff8a65)",
          color: "white",
          fontSize: "1.2rem",
        }}
      >
        Loading Dashboard...
      </div>
    );

  // 🚪 If not logged in, go back to login page
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f50057, #ff8a65)",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "15px 25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontWeight: "700" }}>👋 Welcome</h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "0.95rem" }}>
            {user.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: "white",
            color: "#f50057",
            border: "none",
            borderRadius: "25px",
            padding: "8px 18px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px 20px",
          textAlign: "center",
        }}
      >
        <AnimatePresence mode="wait">
          {view === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                width: "100%",
                maxWidth: "400px",
              }}
            >
              <h2 style={{ fontWeight: "700", marginBottom: "10px" }}>
                Dashboard
              </h2>
              <p style={{ opacity: 0.9, fontSize: "1rem" }}>
                What would you like to do today?
              </p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setView("profile")}
                style={menuBtn("white", "#f50057")}
              >
                💖 Create / Update My Profile
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (!myProfile) {
                    alert("Please create your profile first before swiping 💖");
                    return;
                  }
                  setView("swipe");
                }}
                style={{
                  width: "100%",
                  background: "#fff",
                  color: "#ff8a65",
                  border: "none",
                  borderRadius: "15px",
                  padding: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "1rem",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                }}
              >
                💫 Start Swiping (Find Matches)
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/matches")}
                style={menuBtn("transparent", "white", true)}
              >
                💌 View Likes / Matches
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/my-profile")}
                style={menuBtn("#fff", "#f50057")}
              >
                👀 View My Profile
              </motion.button>
            </motion.div>
          )}

          {view === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: "100%", maxWidth: "600px" }}
            >
              <ProfileForm user={user} />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setView("menu")}
                style={backBtn}
              >
                ← Back
              </motion.button>
            </motion.div>
          )}

          {view === "swipe" && (
            <motion.div
              key="swipe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: "100%", maxWidth: "420px" }}
            >
              {myProfile ? (
                <SwipeDeck myProfile={myProfile} />
              ) : (
                <p style={{ color: "white", textAlign: "center" }}>
                  ⚠️ Please create your profile first.
                </p>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setView("menu")}
                style={backBtn}
              >
                ← Back
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Reusable button styles
const menuBtn = (bg, color, outline = false) => ({
  width: "100%",
  background: bg,
  color,
  border: outline ? "2px solid white" : "none",
  borderRadius: "15px",
  padding: "14px",
  fontWeight: "600",
  cursor: "pointer",
  fontSize: "1rem",
  boxShadow: outline ? "none" : "0 6px 20px rgba(0,0,0,0.2)",
});

const backBtn = {
  marginTop: "20px",
  background: "#fff",
  color: "#f50057",
  border: "none",
  borderRadius: "15px",
  padding: "10px 25px",
  fontWeight: "600",
  cursor: "pointer",
};
