import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";

export default function ProfileForm({ user, onProfileCreated }) {
  const [form, setForm] = useState({
    full_name: "",
    age: "",
    address: "",
    profession: "",
    sex: "",
    subcaste: "",
    income: "",
    bio: "",
    hobbies: "",
    education: "",
  });
  const [pictures, setPictures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);

  useEffect(() => {
    if (!user) {
      alert("Please log in first.");
      window.location.href = "/login";
    }
  }, [user]);
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setExistingProfile(data);
        setForm(data);
        setPictures(data.pictures || []);
      }
    }
    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleDeleteImage = async (imageUrl) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this photo?"
    );
    if (!confirmDelete) return;

    try {
      // 1️⃣ Extract the storage path from the public URL
      const pathParts = imageUrl.split("/profile-pictures/");
      if (pathParts.length < 2) return alert("Invalid image URL");
      const filePath = pathParts[1];

      // 2️⃣ Delete from Supabase storage
      const { error: storageError } = await supabase.storage
        .from("profile-pictures")
        .remove([filePath]);
      if (storageError) throw storageError;

      // 3️⃣ Update local state immediately
      const updatedPictures = pictures.filter((url) => url !== imageUrl);
      setPictures(updatedPictures);

      // 4️⃣ Update profile in DB
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ pictures: updatedPictures })
        .eq("user_id", user.id);

      if (dbError) throw dbError;

      alert("✅ Photo deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete photo. Please try again.");
    }
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const uploads = [];
    for (const file of files) {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file);

      if (!error) {
        const publicUrl = `${
          supabase.storage.from("profile-pictures").getPublicUrl(filePath).data
            .publicUrl
        }`;
        uploads.push(publicUrl);
      }
    }
    setPictures((prev) => [...prev, ...uploads]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const profileData = { ...form, user_id: user.id, pictures };

    let result;
    if (existingProfile) {
      result = await supabase
        .from("profiles")
        .update(profileData)
        .eq("user_id", user.id);
    } else {
      result = await supabase.from("profiles").insert([profileData]);
    }

    setLoading(false);
    if (result.error) {
      alert("Error saving profile: " + result.error.message);
    } else {
      alert(
        existingProfile
          ? "Profile updated successfully!"
          : "Profile created successfully!"
      );
      if (onProfileCreated) onProfileCreated();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          padding: "30px",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#f50057",
            marginBottom: "25px",
            fontWeight: "bold",
          }}
        >
          {existingProfile ? "Edit Your Profile" : "Create Your Profile"}
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Basic Info */}
          <div>
            <h4 style={{ color: "#555", marginBottom: "10px" }}>Basic Info</h4>
            <input
              name="full_name"
              placeholder="Full Name"
              value={form.full_name}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              name="age"
              type="number"
              placeholder="Age"
              value={form.age}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <select
              name="sex"
              value={form.sex}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input
              name="profession"
              placeholder="Profession"
              value={form.profession}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              name="address"
              placeholder="Address / Place of Residence"
              value={form.address}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* Optional Info */}
          <div>
            <h4 style={{ color: "#555", marginBottom: "10px" }}>
              Additional Info
            </h4>
            <select
              name="subcaste"
              value={form.subcaste}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Select Subcaste (Optional)</option>
              <option value="Prabhu">Prabhu</option>
              <option value="Pai">Pai</option>
              <option value="Kamath">Kamath</option>
              <option value="Rao">Rao</option>
              <option value="Mallaya">Mallaya</option>
              <option value="Shenoy">Shenoy</option>
              <option value="Naik">Naik</option>
              <option value="Baliga">Baliga</option>
            </select>
            <input
              name="income"
              placeholder="Annual Income (Optional)"
              value={form.income}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="education"
              placeholder="Education (Optional)"
              value={form.education}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="hobbies"
              placeholder="Hobbies (Optional)"
              value={form.hobbies}
              onChange={handleChange}
              style={inputStyle}
            />
            <textarea
              name="bio"
              placeholder="Bio / Tagline (Optional)"
              value={form.bio}
              onChange={handleChange}
              rows="3"
              style={{ ...inputStyle, resize: "none" }}
            />
          </div>

          {/* Photo Upload */}
          {/* Photo Upload */}
          <div>
            <h4 style={{ color: "#555", marginBottom: "10px" }}>
              Profile Photos
            </h4>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={{ marginBottom: "10px" }}
            />

            {/* Image Grid */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              {pictures.map((url, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    width: "90px",
                    height: "90px",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={url}
                    alt={`pic-${i}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      border: "2px solid #f50057",
                      borderRadius: "10px",
                    }}
                  />

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(url)}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      background: "rgba(0,0,0,0.7)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "22px",
                      height: "22px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
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
              marginTop: "10px",
            }}
          >
            {loading ? "Saving..." : "Save Profile"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 15px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  fontSize: "1rem",
  marginBottom: "12px",
  outline: "none",
};
