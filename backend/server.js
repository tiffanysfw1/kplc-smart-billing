const express = require("express");
const cors = require("cors");
const pool = require("./db");
const axios = require("axios");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS Setup
app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173"],
    credentials: true,
  })
);

// Root Endpoint
app.get("/", (req, res) => {
  res.send("🚀 KPLC Smart Billing API Running...");
});

// Helper Functions
const generateToken = () =>
  Math.floor(100000000000 + Math.random() * 900000000000).toString();

const formatPhoneNumber = (phone) => {
  if (phone.startsWith("+")) phone = phone.slice(1);
  if (phone.startsWith("0")) return "254" + phone.slice(1);
  if (!phone.startsWith("254")) return "254" + phone;
  return phone;
};

// Get M-PESA Access Token
const getMpesaAccessToken = async () => {
  const auth = Buffer.from(`${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`).toString("base64");

  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("❌ M-PESA Access Token Error:", error.message);
    throw new Error("Failed to get M-PESA access token");
  }
};

// STK Push - Send Payment Request
app.post("/mpesa/stk-push", async (req, res) => {
  const { phoneNumber, amount, meterNumber } = req.body;

  if (!phoneNumber || !amount || !meterNumber) {
    return res.status(400).json({ error: "⚠️ Missing fields: phoneNumber, amount, meterNumber." });
  }

  try {
    const accessToken = await getMpesaAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(
      `${process.env.BUSINESS_SHORTCODE}${process.env.PASSKEY}${timestamp}`
    ).toString("base64");

    const payload = {
      BusinessShortCode: 174379,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formatPhoneNumber(phoneNumber),
      PartyB: 174379,
      PhoneNumber: formatPhoneNumber(phoneNumber),
      CallBackURL: `${process.env.CALLBACK_URL}/mpesa/confirmation`,
      AccountReference: meterNumber,
      TransactionDesc: "Paying for electricity tokens",
    };

    const stkPushResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ STK Push Response:", stkPushResponse.data);

    if (stkPushResponse.data.ResponseCode === "0") {
      res.json({
        message: "✅ Payment prompt sent successfully!",
        data: stkPushResponse.data,
      });
    } else {
      res.status(400).json({
        error: "⚠️ Failed to initiate M-PESA STK Push",
        details: stkPushResponse.data,
      });
    }
  } catch (error) {
    console.error("❌ STK Push Error:", error.response?.data || error.message);
    res.status(500).json({ error: "⚠️ Failed to send STK Push", details: error.response?.data || error.message });
  }
});

// Register User
app.post("/api/auth/register", async (req, res) => {
  const { firstName, lastName, phone, email, meterNumber, password } = req.body;

  try {
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "❌ Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (first_name, last_name, phone, email, meter_number, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [firstName, lastName, phone, email, meterNumber, hashedPassword]
    );

    res.status(201).json({ message: "✅ User registered successfully", user: result.rows[0] });
  } catch (err) {
    console.error("❌ Registration Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Login User
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: "❌ Invalid credentials" });
    }

    const user = userRes.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "❌ Invalid credentials" });
    }

    res.json({
      message: "✅ Login successful",
      user: {
        id: user.id,
        name: user.first_name,
        email: user.email,
        meterNumber: user.meter_number,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Buy Tokens
app.post("/buy-tokens", async (req, res) => {
  const { meterNumber, amount, phoneNumber, paymentMethod } = req.body;

  if (!meterNumber || !amount || !phoneNumber || !paymentMethod) {
    return res.status(400).json({ error: "⚠️ All fields are required" });
  }

  if (amount < 10) {
    return res.status(400).json({ error: "⚠️ Minimum amount is 10 Ksh" });
  }

  if (paymentMethod !== "mpesa") {
    return res.status(400).json({ error: "⚠️ Only M-PESA payment method is supported" });
  }

  try {
    const token = generateToken();
    const formattedPhone = formatPhoneNumber(phoneNumber);

    const newTx = await pool.query(
      "INSERT INTO transactions (meter_number, amount, phone_number, payment_method, token, status, timestamp) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *",
      [meterNumber, amount, formattedPhone, paymentMethod, token, "pending"]
    );

    // Trigger M-PESA STK Push
    const stkResponse = await axios.post(`http://localhost:${PORT}/mpesa/stk-push`, {
      phoneNumber: formattedPhone,
      amount: amount,
      meterNumber: meterNumber,
    });

    if (stkResponse.data.message) {
      res.json({
        message: "✅ Payment prompt sent. Complete payment on your phone.",
        token,
        transaction: newTx.rows[0],
      });

    } else {
      res.status(400).json({ error: "⚠️ Failed to send payment prompt" });
    }
  } catch (error) {
    console.error("❌ Token Purchase Error:", error.message);
    res.status(500).json({ error: "Server error buying tokens", details: error.message });
  }
});

// M-PESA Callbacks
app.post("/mpesa/confirmation", async (req, res) => {
  console.log("📥 M-PESA Confirmation Received:", req.body);
  const { Body } = req.body;

  const { stkCallback } = Body;
  const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;
  const { BillRefNumber, TransAmount } = stkCallback;

  console.log("Received confirmation for BillRefNumber:", BillRefNumber, "and TransAmount:", TransAmount);

  try {
    if (ResultCode === 0) {
      const token = generateToken(); // Generate the token
      console.log("✅ Payment Successful! Generated Token:", token);

      const result = await pool.query(
        "UPDATE transactions SET transaction_id = $1, status = 'completed', token = $2 WHERE meter_number = $3 AND amount = $4 AND status = 'pending' RETURNING *",
        [CheckoutRequestID, token, BillRefNumber, TransAmount]
      );

      if (result.rows.length > 0) {
        res.json({ ResultCode: 0, ResultDesc: "Accepted" });
      } else {
        res.json({ ResultCode: 1, ResultDesc: "Transaction not found or not pending" });
      }
    } else if (ResultCode === 1032) {
      const result = await pool.query(
        "UPDATE transactions SET status = 'canceled', transaction_id = $1 WHERE meter_number = $2 AND amount = $3 AND status = 'pending' RETURNING *",
        [CheckoutRequestID, BillRefNumber, TransAmount]
      );

      if (result.rows.length > 0) {
        res.json({ ResultCode: 1, ResultDesc: "Request canceled by user" });
      } else {
        res.json({ ResultCode: 1, ResultDesc: "Transaction not found or not pending" });
      }
    } else {
      res.json({ ResultCode: 1, ResultDesc: "Payment failed" });
    }
  } catch (error) {
    console.error("❌ Callback Error:", error.message);
    res.status(500).json({ error: "Server error on confirmation", details: error.message });
  }
});

// Register M-PESA C2B URLs
app.post("/mpesa/register", async (req, res) => {
  try {
    const accessToken = await getMpesaAccessToken();

    const registerRes = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl",
      {
        ShortCode: process.env.BUSINESS_SHORTCODE,
        ResponseType: "Completed",
        ConfirmationURL: `${process.env.CALLBACK_URL}/confirmation`,
        ValidationURL: `${process.env.CALLBACK_URL}/validation`,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    res.json({ message: "✅ URLs Registered", data: registerRes.data });
  } catch (err) {
    console.error("❌ URL Registration Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to register URLs", details: err.message });
  }
});

// M-PESA Validation
app.post("/mpesa/validation", (req, res) => {
  console.log("📥 M-PESA Validation Request:", req.body);
  res.json({ ResultCode: 0, ResultDesc: "Validation Accepted" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
