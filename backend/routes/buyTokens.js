const express = require("express");
const router = express.Router();
const TokenTransaction = require("../models/TokenTransaction");

// Function to generate a random token
const generateToken = () => {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
};

router.post("/buy-tokens", async (req, res) => {
  const { meterNumber, amount } = req.body;

  if (!meterNumber || !amount) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  // Generate a token
  const token = generateToken();

  try {
    // Save transaction to database
    const newTransaction = new TokenTransaction({
      meterNumber,
      amount,
      token,
      status: "Success",
    });
    await newTransaction.save();

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;