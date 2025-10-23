import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";

export default function ProfileView() {
  const { id } = useParams(); // profile id (for viewing others)
  const [profile, setProfile] = useState(null);
  const [userProfileId, setUserProfileId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      // If viewing others:
      if (id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();
        if (!error) setProfile(data);
      } else {
        // If viewing own profile
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return navigate("/login");

        const { data: myProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (myProfile) {
          setProfile(myProfile);
          setUserProfileId(myProfile.id);
        }
      }
    }

    loadProfile();
  }, [id, navigate]);

  if (!profile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #f50057, #ff8a65)",
          color: "white",
        }}
      >
        <p>Loading profile...</p>
      </div>
    );
  }

  const isOwnProfile = !id || id === userProfileId;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f50057, #ff8a65)",
        color: "white",
        display: "flex",
        justifyContent: "center",
        padding: "30px 20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: "white",
          color: "#333",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          width: "100%",
          maxWidth: "700px",
          overflow: "hidden",
        }}
      >
        {/* Cover Image */}
        <div style={{ position: "relative" }}>
          <img
            src={
              profile.pictures?.[0] ||
              "https://via.placeholder.com/700x400?text=No+Photo"
            }
            alt="cover"
            style={{ width: "100%", height: "280px", objectFit: "cover" }}
          />
        </div>

        {/* Profile Info */}
        <div style={{ padding: "25px" }}>
          <h2
            style={{
              color: "#f50057",
              marginBottom: "10px",
              fontWeight: "bold",
              fontSize: "1.6rem",
            }}
          >
            {profile.full_name}, {profile.age}
          </h2>
          <p style={{ margin: "5px 0", color: "#555" }}>
            📍 {profile.address || "Location not provided"}
          </p>
          <p style={{ margin: "5px 0", color: "#555" }}>
            💼 {profile.profession || "Profession not mentioned"}
          </p>

          {profile.bio && (
            <p
              style={{
                marginTop: "15px",
                fontStyle: "italic",
                color: "#777",
                background: "rgba(245,0,87,0.08)",
                padding: "10px",
                borderRadius: "10px",
              }}
            >
              “{profile.bio}”
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            {profile.subcaste && (
              <div style={infoBox}>
                <strong>Subcaste:</strong> {profile.subcaste}
              </div>
            )}
            {profile.education && (
              <div style={infoBox}>
                <strong>Education:</strong> {profile.education}
              </div>
            )}
            {profile.income && (
              <div style={infoBox}>
                <strong>Annual Income:</strong> ₹{profile.income}
              </div>
            )}
            {profile.hobbies && (
              <div style={infoBox}>
                <strong>Hobbies:</strong> {profile.hobbies}
              </div>
            )}
          </div>

          {/* Gallery */}
          {profile.pictures && profile.pictures.length > 1 && (
            <>
              <h3
                style={{
                  marginTop: "25px",
                  color: "#f50057",
                  fontWeight: "bold",
                }}
              >
                Photos
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                {profile.pictures.slice(1).map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`pic-${idx}`}
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "10px",
                      objectFit: "cover",
                      border: "2px solid #f50057",
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Buttons */}
          <div
            style={{
              marginTop: "30px",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              style={pinkBtn}
              onClick={() => navigate(-1)}
            >
              ← Back
            </motion.button>

            {isOwnProfile ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                style={whiteBtn}
                onClick={() => navigate("/edit-profile")}
              >
                ✏️ Edit My Profile
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                style={whiteBtn}
                onClick={() => navigate(`/chat/${profile.id}`)}
              >
                💬 Message
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const infoBox = {
  background: "rgba(245,0,87,0.08)",
  padding: "10px",
  borderRadius: "10px",
  color: "#555",
  fontSize: "0.95rem",
};

const pinkBtn = {
  background: "#f50057",
  color: "white",
  border: "none",
  borderRadius: "10px",
  padding: "10px 20px",
  fontWeight: "bold",
  cursor: "pointer",
};

const whiteBtn = {
  background: "white",
  color: "#f50057",
  border: "none",
  borderRadius: "10px",
  padding: "10px 20px",
  fontWeight: "bold",
  cursor: "pointer",
};
