import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function MatchesPage() {
  const { user, loading } = useAuth();
  const [myProfile, setMyProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const navigate = useNavigate();

  // 🧠 Fetch user profile + matches
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      // Load current user’s profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile load error:", profileError);
        return;
      }
      if (!profile) return;

      setMyProfile(profile);

      // Load matches
      const { data: matchesData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .or(`profile_a.eq.${profile.id},profile_b.eq.${profile.id}`);

      if (matchError) {
        console.error("Match load error:", matchError);
        return;
      }

      if (!matchesData?.length) {
        setMatches([]);
        setLoadingMatches(false);
        return;
      }

      await loadMatchProfiles(profile, matchesData);
      setLoadingMatches(false);
    }

    fetchData();
  }, [user]);

  // ♻️ Realtime updates for matches and chats
  useEffect(() => {
    if (!myProfile) return;

    const matchChannel = supabase
      .channel("realtime:matches")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "matches" },
        (payload) => {
          const newMatch = payload.new;
          if (
            newMatch.profile_a === myProfile?.id ||
            newMatch.profile_b === myProfile?.id
          ) {
            refreshMatches();
          }
        }
      )
      .subscribe();

    const chatChannel = supabase
      .channel("realtime:chats")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chats" },
        () => {
          refreshMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
      supabase.removeChannel(chatChannel);
    };
  }, [myProfile]);

  // 🔁 Refresh matches (called by realtime)
  const refreshMatches = async () => {
    if (!myProfile) return;

    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .or(`profile_a.eq.${myProfile.id},profile_b.eq.${myProfile.id}`);

    if (!matchesData?.length) {
      setMatches([]);
      return;
    }

    await loadMatchProfiles(myProfile, matchesData);
  };

  // 🧩 Helper: Load matched profiles + last messages
  async function loadMatchProfiles(profile, matchesData) {
    const otherProfileIds = matchesData.map((m) =>
      m.profile_a === profile.id ? m.profile_b : m.profile_a
    );

    if (otherProfileIds.length === 0) {
      setMatches([]);
      return;
    }

    const { data: matchedProfiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", otherProfileIds);

    const { data: allChats } = await supabase
      .from("chats")
      .select("match_id, message, created_at")
      .order("created_at", { ascending: false });

    const merged = matchesData.map((m) => {
      const otherProfile =
        m.profile_a === profile.id
          ? matchedProfiles.find((p) => p.id === m.profile_b)
          : matchedProfiles.find((p) => p.id === m.profile_a);

      const lastMsg = allChats.find((c) => c.match_id === m.id);

      return {
        match_id: m.id,
        other_profile: otherProfile,
        last_message: lastMsg ? lastMsg.message : null,
        last_time: lastMsg
          ? new Date(lastMsg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
      };
    });

    setMatches(merged);
  }

  // 🕐 Loading states
  if (loading || loadingMatches)
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
        Loading your matches...
      </div>
    );

  // 🚪 Handle not logged in
  if (!user) {
    navigate("/login");
    return null;
  }

  // 🧠 UI
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f50057, #ff8a65)",
        color: "white",
        textAlign: "center",
        padding: "30px 10px",
      }}
    >
      <h2 style={{ marginBottom: "20px", fontWeight: 700 }}>💞 Your Matches</h2>

      {matches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ marginTop: "80px", color: "#fff", fontSize: "1.3rem" }}
        >
          <p>No matches yet 😅</p>
          <p style={{ fontSize: "1.1rem", color: "#ffeeee" }}>
            Keep swiping — your perfect match might be next 💫
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
          {matches.map(
            ({ match_id, other_profile, last_message, last_time }) => (
              <motion.div
                key={match_id}
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
                    other_profile?.pictures?.[0] ||
                    "https://via.placeholder.com/260x280?text=No+Image"
                  }
                  alt={other_profile?.full_name}
                  style={{
                    width: "100%",
                    height: 220,
                    objectFit: "cover",
                  }}
                />
                <div style={{ padding: "10px 15px", textAlign: "left" }}>
                  <h3 style={{ margin: "8px 0 2px", fontSize: "1.3rem" }}>
                    {other_profile?.full_name}, {other_profile?.age}
                  </h3>
                  <p style={{ color: "#ffd", margin: "0 0 4px" }}>
                    {other_profile?.profession || "No profession listed"}
                  </p>
                  {last_message && (
                    <p style={{ color: "#ddd", fontSize: "0.9rem" }}>
                      <strong>Last:</strong> {last_message}
                      <br />
                      <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                        {last_time}
                      </span>
                    </p>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(`/chat/${match_id}`)}
                    style={{
                      background: "#fff",
                      color: "#f50057",
                      border: "none",
                      padding: "10px 25px",
                      borderRadius: 30,
                      fontWeight: "600",
                      cursor: "pointer",
                      marginTop: 8,
                      width: "100%",
                    }}
                  >
                    Chat 💬
                  </motion.button>
                </div>
              </motion.div>
            )
          )}
        </div>
      )}
    </div>
  );
}
