const express = require("express");
const Token = require("../models/Token");
const generateToken = require("../utils/generateToken");

const router = express.Router();

// Buy electricity - Generate Token
router.post("/buy", async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount || amount < 1) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const units = amount * 2; // 1 KES = 2 Units (Example Rate)
  const token = generateToken();

  try {
    const newToken = new Token({ userId, amount, token, units });
    await newToken.save();
    res.json({ message: "Token generated", token, units });
  } catch (error) {
    res.status(500).json({ error: "Error generating token" });
  }
});

module.exports = router;

