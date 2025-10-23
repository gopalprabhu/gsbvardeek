import React, { useEffect, useState } from "react";
import TinderCard from "react-tinder-card";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function SwipeDeck({ myProfile }) {
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [matchName, setMatchName] = useState("");
  const [showMatch, setShowMatch] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchProfiles() {
      if (!myProfile) return;
      const oppositeSex = myProfile.sex === "male" ? "female" : "male";

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("sex", oppositeSex)
        .neq("user_id", myProfile.user_id);

      if (error) console.error("Error fetching profiles:", error);
      else setProfiles(data);
    }

    fetchProfiles();
  }, [myProfile]);

  const handleSwipe = async (direction, targetProfile) => {
    if (direction === "right") {
      // User liked someone
      await supabase
        .from("likes")
        .insert([{ from_profile: myProfile.id, to_profile: targetProfile.id }]);

      // Check if that person liked them back
      const { data: reciprocal } = await supabase
        .from("likes")
        .select("*")
        .eq("from_profile", targetProfile.id)
        .eq("to_profile", myProfile.id)
        .maybeSingle();

      // ✅ If mutual match
      if (reciprocal) {
        // Create match and fetch its ID
        const { data: newMatch, error } = await supabase
          .from("matches")
          .insert([{ profile_a: myProfile.id, profile_b: targetProfile.id }])
          .select()
          .single();

        if (error) {
          console.error("Error creating match:", error);
          return;
        }

        // Redirect to chat page with match ID
        setMatchName(targetProfile.full_name);
        setShowMatch(true);

        setTimeout(() => {
          setShowMatch(false);
          navigate(`/chat/${newMatch.id}`);
        }, 2500);
      }
    }

    // move to next card
    setProfiles((prev) => prev.filter((p) => p.id !== targetProfile.id));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f50057, #ff8a65)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <h2 style={{ color: "white", fontWeight: 600, marginBottom: "10px" }}>
        Discover
      </h2>
      <h3
        onClick={() => navigate(`/profile/${profile.id}`)}
        style={{
          cursor: "pointer",
          textDecoration: "underline",
          color: "#f50057",
          fontWeight: 700,
          fontSize: "1.3rem",
        }}
      >
        {profile.full_name}, {profile.age}
      </h3>

      <div style={{ position: "relative", width: 320, height: 480 }}>
        <AnimatePresence>
          {profiles.slice(0, 3).map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -40 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: 20,
                background: "#fff",
                boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <TinderCard
                onSwipe={(dir) => handleSwipe(dir, profile)}
                preventSwipe={["up", "down"]}
              >
                <div style={{ height: "100%", cursor: "grab" }}>
                  <img
                    src={
                      profile.pictures?.[0] ||
                      "https://via.placeholder.com/320x480?text=No+Image"
                    }
                    alt={profile.full_name}
                    style={{
                      width: "100%",
                      height: "65%",
                      objectFit: "cover",
                    }}
                  />
                  <div style={{ padding: "15px" }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.4rem",
                        color: "#333",
                        fontWeight: 700,
                      }}
                    >
                      {profile.full_name}, {profile.age}
                    </h3>
                    <p style={{ color: "#555", marginTop: 4 }}>
                      {profile.profession || "No profession listed"}
                    </p>
                    <p style={{ color: "#888", fontSize: "0.9rem" }}>
                      {profile.residence || ""}
                    </p>
                  </div>
                </div>
              </TinderCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating action buttons */}
      <div style={{ display: "flex", gap: 40, marginTop: 30 }}>
        <motion.button
          whileTap={{ scale: 0.85 }}
          style={{
            background: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 60,
            height: 60,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
            cursor: "pointer",
          }}
          onClick={() => handleSwipe("left", profiles[0])}
        >
          <span style={{ color: "#ff1744", fontSize: "1.5rem" }}>✖</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          style={{
            background: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 60,
            height: 60,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
            cursor: "pointer",
          }}
          onClick={() => handleSwipe("right", profiles[0])}
        >
          <span style={{ color: "#f50057", fontSize: "1.8rem" }}>❤</span>
        </motion.button>
      </div>

      {/* Match Popup */}
      <AnimatePresence>
        {showMatch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              flexDirection: "column",
              zIndex: 1000,
            }}
          >
            <h2 style={{ fontSize: "2rem" }}>🎉 It’s a Match!</h2>
            <p style={{ fontSize: "1.2rem" }}>
              You and <strong>{matchName}</strong> like each other 💕
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
