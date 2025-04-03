const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // For generating tokens
const pool = require("../db"); // Import PostgreSQL connection

const router = express.Router();

// Login Route
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
            "your_secret_key", // Replace with a secure key
            { expiresIn: "1h" }
        );

        res.json({ message: "✅ Login successful!", token, user });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ message: "❌ Server error", error: error.message });
    }
});

module.exports = router;
