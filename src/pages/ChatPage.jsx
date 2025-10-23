import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ChatPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [myProfile, setMyProfile] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [channel, setChannel] = useState(null);
  const messagesEndRef = useRef(null);

  // 🧠 Load current user's profile (from Supabase profiles)
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) console.error("Profile load error:", error);
      else setMyProfile(profile);
    }

    fetchProfile();
  }, [user]);

  // 🧠 Load match + chat partner
  useEffect(() => {
    async function fetchChatPartner() {
      if (!matchId || !myProfile) return;

      const { data: matchData, error: matchErr } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (matchErr || !matchData) return console.error(matchErr);

      const partnerId =
        matchData.profile_a === myProfile.id
          ? matchData.profile_b
          : matchData.profile_a;

      const { data: partnerProfile } = await supabase
        .from("profiles")
        .select("id, full_name, pictures")
        .eq("id", partnerId)
        .single();

      setChatPartner(partnerProfile);
    }

    fetchChatPartner();
  }, [matchId, myProfile]);

  // 🧱 Load previous messages
  useEffect(() => {
    if (!matchId) return;

    async function loadMessages() {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (error) console.error("Chat load error:", error);
      else setMessages(data);
    }

    loadMessages();
  }, [matchId]);

  // 🧩 Real-time channel for chat
  useEffect(() => {
    if (!matchId) return;

    const ch = supabase.channel(`chat-${matchId}`, {
      config: { broadcast: { self: true } },
    });

    ch.on("broadcast", { event: "message" }, (payload) => {
      setMessages((prev) => [...prev, payload.payload]);
    });

    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") console.log("✅ Connected to chat", matchId);
    });

    setChannel(ch);
    return () => supabase.removeChannel(ch);
  }, [matchId]);

  // 🔄 Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 📨 Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !myProfile || !channel) return;

    const msg = {
      match_id: matchId,
      sender_id: myProfile.id,
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage("");

    await channel.send({
      type: "broadcast",
      event: "message",
      payload: msg,
    });

    const { error } = await supabase.from("chats").insert([msg]);
    if (error) console.error("Send error:", error);
  };

  // 🕐 Handle auth loading
  if (loading)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          background: "linear-gradient(135deg, #f50057, #ff8a65)",
        }}
      >
        Loading Chat...
      </div>
    );

  if (!user)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          background: "linear-gradient(135deg, #f50057, #ff8a65)",
        }}
      >
        Please log in to continue.
      </div>
    );

  return (
    <div
      style={{
        background: "linear-gradient(135deg,#f50057,#ff8a65)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "white",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          padding: "15px 0",
          borderBottom: "1px solid rgba(255,255,255,0.3)",
          fontWeight: "bold",
        }}
      >
        💬 Chat
        {chatPartner && (
          <div
            onClick={() => navigate(`/profile/${chatPartner.id}`)}
            style={{
              marginTop: "5px",
              fontSize: "1.1rem",
              cursor: "pointer",
              textDecoration: "underline",
              color: "white",
            }}
          >
            {chatPartner.full_name}
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {messages.length === 0 ? (
          <p style={{ opacity: 0.8, textAlign: "center" }}>
            No messages yet. Start the conversation 💬
          </p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf:
                  msg.sender_id === myProfile?.id ? "flex-end" : "flex-start",
                background:
                  msg.sender_id === myProfile?.id
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(0,0,0,0.3)",
                color: msg.sender_id === myProfile?.id ? "#f50057" : "white",
                padding: "10px 15px",
                borderRadius: 20,
                maxWidth: "75%",
                fontSize: "1rem",
                wordBreak: "break-word",
              }}
            >
              {msg.message}
              <div
                style={{
                  fontSize: "0.75rem",
                  opacity: 0.7,
                  marginTop: 4,
                  textAlign: msg.sender_id === myProfile?.id ? "right" : "left",
                }}
              >
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          padding: "10px 15px",
          borderTop: "1px solid rgba(255,255,255,0.3)",
          background: "rgba(0,0,0,0.1)",
        }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            borderRadius: 20,
            border: "none",
            padding: "10px 15px",
            outline: "none",
            fontSize: "1rem",
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          style={{
            marginLeft: 10,
            background: "#fff",
            color: "#f50057",
            border: "none",
            borderRadius: "50%",
            width: 45,
            height: 45,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
