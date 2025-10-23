import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";

export default function LikesPage() {
  const [myProfile, setMyProfile] = useState(null);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyProfileAndLikes() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      // 1️⃣ Fetch current user's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) console.error("Profile fetch error:", profileError);
      setMyProfile(profile);

      if (!profile) {
        setLoading(false);
        return;
      }

      // 2️⃣ Fetch likes received
      const { data: likesData, error: likesError } = await supabase
        .from("likes")
        .select("from_profile")
        .eq("to_profile", profile.id);

      if (likesError) console.error("Likes fetch error:", likesError);

      const likerIds = likesData?.map((l) => l.from_profile) || [];

      if (likerIds.length === 0) {
        setLikes([]); // no likes yet
        setLoading(false);
        return;
      }

      // 3️⃣ Fetch full liker profiles
      const { data: likerProfiles, error: profileFetchError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", likerIds);

      if (profileFetchError) console.error(profileFetchError);

      setLikes(likerProfiles || []);
      setLoading(false);
    }

    fetchMyProfileAndLikes();
  }, []);

  const handleLikeBack = async (likerProfile) => {
    try {
      await supabase
        .from("likes")
        .insert([{ from_profile: myProfile.id, to_profile: likerProfile.id }]);

      await supabase
        .from("matches")
        .insert([{ profile_a: myProfile.id, profile_b: likerProfile.id }]);

      alert(`It's a match with ${likerProfile.full_name}! 💕`);
      setLikes((prev) => prev.filter((p) => p.id !== likerProfile.id));
    } catch (err) {
      console.error("Error liking back:", err);
    }
  };

  if (loading)
    return (
      <p style={{ color: "white", textAlign: "center" }}>Loading likes...</p>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ff4081, #ff8a65)",
        color: "white",
        textAlign: "center",
        padding: "30px 10px",
      }}
    >
      <h2 style={{ marginBottom: "20px", fontWeight: 700 }}>
        ❤️ Likes Received
      </h2>

      {likes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            marginTop: "80px",
            color: "#fff",
            fontSize: "1.3rem",
            opacity: 0.8,
          }}
        >
          <p>No one has liked you yet 😅</p>
          <p style={{ fontSize: "1.1rem", color: "#ffeeee" }}>
            Keep swiping and you’ll find your match soon 💫
          </p>
        </motion.div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            justifyItems: "center",
          }}
        >
          {likes.map((profile) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                width: 260,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 20,
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                overflow: "hidden",
                backdropFilter: "blur(8px)",
              }}
            >
              <img
                src={
                  profile.pictures?.[0] ||
                  "https://via.placeholder.com/260x280?text=No+Image"
                }
                alt={profile.full_name}
                style={{
                  width: "100%",
                  height: 280,
                  objectFit: "cover",
                }}
              />
              <div style={{ padding: "10px 15px" }}>
                <h3 style={{ margin: "8px 0 2px", fontSize: "1.3rem" }}>
                  {profile.full_name}, {profile.age}
                </h3>
                <p style={{ color: "#ffd", margin: "0 0 6px" }}>
                  {profile.profession || "No profession listed"}
                </p>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLikeBack(profile)}
                  style={{
                    background: "#fff",
                    color: "#f50057",
                    border: "none",
                    padding: "10px 25px",
                    borderRadius: 30,
                    fontWeight: "600",
                    cursor: "pointer",
                    marginTop: 8,
                  }}
                >
                  Like Back ❤️
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
