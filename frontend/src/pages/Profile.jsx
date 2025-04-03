import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { FaUserEdit, FaSave, FaCamera } from "react-icons/fa";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState({
    name: "Tiffany Chetalam",
    email: "tiffany@example.com",
    phone: "+254712345678",
    address: "Nairobi, Kenya",
    meterNumber: "123456789",
    profilePicture: "/images/default-avatar.png",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState(null);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
    alert("Profile updated successfully! ✅");
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNewProfilePicture(imageUrl);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />
        <div className="profile-container">
          <h1>👤 My Profile</h1>
          <div className="profile-card">
            <div className="profile-picture">
              <img src={newProfilePicture || user.profilePicture} alt="Profile" />
              <label className="upload-icon">
                <FaCamera />
                <input type="file" accept="image/*" onChange={handlePictureChange} />
              </label>
            </div>

            <div className="profile-details">
              <label>Name:</label>
              {isEditing ? (
                <input type="text" name="name" value={user.name} onChange={handleChange} />
              ) : (
                <p>{user.name}</p>
              )}

              <label>Email:</label>
              {isEditing ? (
                <input type="email" name="email" value={user.email} onChange={handleChange} />
              ) : (
                <p>{user.email}</p>
              )}

              <label>Phone:</label>
              {isEditing ? (
                <input type="text" name="phone" value={user.phone} onChange={handleChange} />
              ) : (
                <p>{user.phone}</p>
              )}

              <label>Address:</label>
              {isEditing ? (
                <input type="text" name="address" value={user.address} onChange={handleChange} />
              ) : (
                <p>{user.address}</p>
              )}

              <label>Meter Number:</label>
              <p className="meter-number">{user.meterNumber}</p>

              <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <FaSave /> : <FaUserEdit />} {isEditing ? "Save" : "Edit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
