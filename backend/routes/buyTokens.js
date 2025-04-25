const express = require("express");
const router = express.Router();
const TokenTransaction = require("../models/TokenTransaction");

// Function to generate a random token
const generateToken = () => {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
};

// Route to handle token purchase
router.post("/buy-tokens", async (req, res) => {
  const { meterNumber, amount } = req.body;

  // Input validation
  if (!meterNumber || meterNumber.length !== 11) {
    return res.status(400).json({ success: false, message: "Invalid meter number. It must be 11 digits." });
  }

  if (!amount || isNaN(amount) || amount < 10) {
    return res.status(400).json({ success: false, message: "Amount must be a positive number and at least 10 Ksh." });
  }

  // Generate a token
  const token = generateToken();

  try {
    // Save transaction to database
    const newTransaction = new TokenTransaction({
      meterNumber,
      amount,
      token,
      status: "Success", // Transaction status
    });
    await newTransaction.save();

    // Respond with success and the generated token
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
