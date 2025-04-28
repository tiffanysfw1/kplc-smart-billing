const express = require("express");
const router = express.Router();
const TokenTransaction = require("../models/TokenTransaction");

// Function to generate a formatted token like '1234-5678-9012'
const generateToken = () => {
  const tokenParts = [];
  for (let i = 0; i < 3; i++) {
    tokenParts.push(Math.floor(1000 + Math.random() * 9000)); // 4 random digits
  }
  return tokenParts.join("-"); // Join with hyphens
};

// Route to handle token purchase
router.post("/buy-tokens", async (req, res) => {
  const { meterNumber, amount, paymentMethod, phoneNumber, selectedBank, accountNumber, selectedCounty } = req.body;

  // Input validation
  if (!meterNumber || meterNumber.length !== 11) {
    return res.status(400).json({ success: false, message: "Invalid meter number. It must be 11 digits." });
  }

  if (!amount || isNaN(amount) || amount < 10) {
    return res.status(400).json({ success: false, message: "Amount must be at least 10 Ksh." });
  }

  if (paymentMethod === "mpesa" && (!phoneNumber || phoneNumber.length !== 10)) {
    return res.status(400).json({ success: false, message: "Phone number must be 10 digits." });
  }

  if (paymentMethod === "bank" && (!selectedBank || !accountNumber || !selectedCounty)) {
    return res.status(400).json({ success: false, message: "All bank details must be provided." });
  }

  const token = generateToken();

  try {
    const newTransaction = new TokenTransaction({
      meterNumber,
      amount,
      paymentMethod,
      phoneNumber,
      selectedBank,
      accountNumber,
      selectedCounty,
      token,
      status: "Success",
    });

    await newTransaction.save();

    res.json({ success: true, message: "Payment processed successfully.", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
});

// Route to confirm bank payment
router.post("/confirm-bank-payment", async (req, res) => {
  const { meterNumber, accountNumber, selectedBank, selectedCounty } = req.body;

  if (!meterNumber || meterNumber.length !== 11) {
    return res.status(400).json({ success: false, message: "Invalid meter number." });
  }

  if (!accountNumber || !selectedBank || !selectedCounty) {
    return res.status(400).json({ success: false, message: "Incomplete bank details." });
  }

  const token = generateToken();

  try {
    const updatedTransaction = await TokenTransaction.findOneAndUpdate(
      { meterNumber, accountNumber, selectedBank, selectedCounty, status: "Pending" },
      { status: "Confirmed", token },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ success: false, message: "Transaction not found or already confirmed." });
    }

    res.json({ success: true, message: "Bank payment confirmed. Token generated.", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error while confirming payment." });
  }
});

module.exports = router;
