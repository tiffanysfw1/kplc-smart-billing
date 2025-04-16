const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const pool = require("../db");
require("dotenv").config();

const router = express.Router();

// Existing Login Route - No changes here
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "❌ Incorrect email or password." });
    }

    const user = userResult.rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "❌ Incorrect email or password." });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET, // Use secret key from .env
      { expiresIn: "1h" }
    );

    // Exclude password from response
    const { password: _, ...userData } = user;

    res.json({ message: "✅ Login successful!", token, user: userData });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// NEW: Forgot Password Route (Generate Reset Token and Link)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists in the database
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "❌ Email not found" });
    }

    const user = userResult.rows[0];

    // Create a password reset token (valid for 15 minutes)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET, // Use secret key from .env
      { expiresIn: "15m" } // Token expires in 15 minutes
    );

    // Create the reset password link
    const resetLink = `http://localhost:5173/reset-password?token=${token}`; // Replace with your actual frontend URL

    // Send the reset link via email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Add your email
        pass: process.env.EMAIL_PASS, // Add your email password or app-specific password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `Hello,\n\nTo reset your password, click the link below:\n\n${resetLink}\n\nIf you did not request a password reset, please ignore this email.\n\nThank you.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: "✅ Password reset link sent to your email",
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// NEW: Reset Password Route (Verify Token and Update Password)
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify the token and decode user ID from the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, userId]
    );

    res.json({ message: "✅ Password reset successful" });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(400).json({ message: "❌ Invalid or expired token", error: error.message });
  }
});

module.exports = router;
