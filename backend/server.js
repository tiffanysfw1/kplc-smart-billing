const express = require("express");
const cors = require("cors");
const pool = require("./db");
const axios = require("axios");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ CORS Configuration: Allow only Vercel frontend and local development URLs
const allowedOrigins = [
  "https://your-vercel-frontend-url.vercel.app",  // Replace with your actual Vercel frontend URL
  "http://localhost:5173",  // Local development URL for testing
];

// Use CORS middleware to allow requests from specific origins
app.use(
  cors({
    origin: allowedOrigins,  // Allow only these origins to access your backend
    credentials: true,        // Allow credentials (cookies, sessions) in requests
  })
);

// ✅ Middleware
app.use(express.json()); // Built-in body parser

// ✅ Root
app.get("/", (req, res) => {
  res.send("🚀 KPLC C2B API running...");
});

// ✅ Register User
app.post("/api/auth/register", async (req, res) => {
  const { firstName, lastName, phone, email, meterNumber, password } = req.body;

  try {
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "❌ Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (first_name, last_name, phone, email, meter_number, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [firstName, lastName, phone, email, meterNumber, hashedPassword]
    );

    res.status(201).json({ message: "✅ Registration successful", user: result.rows[0] });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login User
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: "❌ Invalid credentials" });
    }

    const user = userRes.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
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
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Generate Random Token
const generateToken = () =>
  Math.floor(100000000000 + Math.random() * 900000000000).toString();

// ✅ Format Phone Number
const formatPhoneNumber = (phone) => {
  if (phone.startsWith("+")) phone = phone.slice(1);
  if (phone.startsWith("0")) return "254" + phone.slice(1);
  if (!phone.startsWith("254")) return "254" + phone;
  return phone;
};

// ✅ Buy Tokens (with payment via M-PESA)
app.post("/buy-tokens", async (req, res) => {
  const { meterNumber, amount, phoneNumber, paymentMethod } = req.body;

  // Check if all fields are provided
  if (!meterNumber || !amount || !phoneNumber || !paymentMethod) {
    return res.status(400).json({ error: "⚠️ All fields are required!" });
  }

  // Check if the amount is greater than or equal to 10
  if (amount < 10) {
    return res.status(400).json({ error: "⚠️ Minimum amount is 10 Ksh." });
  }

  // Ensure only M-PESA is the valid payment method
  if (paymentMethod !== "mpesa") {
    return res.status(400).json({ error: "⚠️ Only M-PESA C2B is supported now." });
  }

  // Generate a random token for the transaction
  const token = generateToken();
  const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

  try {
    // Insert the transaction into the database with status "pending"
    const newTx = await pool.query(
      "INSERT INTO transactions (meter_number, amount, phone_number, payment_method, token, status, timestamp) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *",
      [meterNumber, amount, formattedPhoneNumber, paymentMethod, token, "pending"]
    );

    // Respond with a message to the user, asking them to pay via M-PESA
    return res.json({
      message: "✅ Please pay via M-PESA Till number 487420 with your meter number as Account.",
      token,
      transaction: newTx.rows[0],
    });
  } catch (error) {
    console.error("❌ DB Error:", error);
    return res.status(500).json({ error: "Server error while creating transaction." });
  }
});

// ✅ M-PESA Confirmation
app.post("/mpesa/confirmation", async (req, res) => {
  const { TransID, TransAmount, MSISDN, BillRefNumber, FirstName } = req.body;

  console.log("📥 M-PESA Confirmed:", req.body);

  try {
    // Update the transaction status to "completed" after confirmation
    const result = await pool.query(
      "UPDATE transactions SET transaction_id = $1, customer_name = $2, status = $3 WHERE meter_number = $4 AND amount = $5 RETURNING *",
      [TransID, FirstName, "completed", BillRefNumber, TransAmount]
    );

    if (result.rows.length > 0) {
      res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    } else {
      res.json({ ResultCode: 1, ResultDesc: "Transaction Not Found" });
    }
  } catch (error) {
    console.error("❌ Error updating transaction:", error);
    res.status(500).json({ error: "Server error updating transaction." });
  }
});

// ✅ M-PESA Validation (for checking payment details)
app.post("/mpesa/validation", (req, res) => {
  console.log("🔎 Validation:", req.body);
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

// ✅ Register M-PESA C2B URLs (for M-PESA integration)
app.post("/mpesa/register", async (req, res) => {
  const { CONSUMER_KEY, CONSUMER_SECRET, CALLBACK_URL, BUSINESS_SHORTCODE } = process.env;

  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");

  try {
    // Get the access token from M-PESA
    const tokenRes = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );

    const accessToken = tokenRes.data.access_token;

    // Register the M-PESA C2B URLs for the response
    const registerRes = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl",
      {
        ShortCode: BUSINESS_SHORTCODE,
        ResponseType: "Completed",
        ConfirmationURL: `${CALLBACK_URL}/mpesa/confirmation`,
        ValidationURL: `${CALLBACK_URL}/mpesa/validation`,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    res.json({ message: "✅ C2B URLs Registered", result: registerRes.data });
  } catch (err) {
    console.error("❌ Register error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to register URLs" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is live at http://localhost:${PORT}`);
});
