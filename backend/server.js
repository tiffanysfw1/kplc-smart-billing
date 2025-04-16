const express = require("express");
const cors = require("cors");
const pool = require("./db"); // PostgreSQL connection
const authRoutes = require("./routes/auth"); // Authentication routes
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 5000; // Dynamic port for production

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

// ✅ Root route (for server check)
app.get("/", (req, res) => {
  res.send("🚀 KPLC Smart Billing API is running...");
});

// 🔹 Helper function to generate a random 12-digit token
const generateToken = () => Math.floor(100000000000 + Math.random() * 900000000000).toString();

// 🔹 Constants for payment methods
const PAYMENT_METHODS = {
  MPESA: "mpesa",
  BANK: "bank",
};

// ✅ Route to buy tokens
app.post("/buy-tokens", async (req, res) => {
  const { meterNumber, amount, phoneNumber, paymentMethod } = req.body;

  if (!meterNumber || !amount || !phoneNumber || !paymentMethod) {
    return res.status(400).json({ error: "⚠️ All fields are required!" });
  }

  if (amount < 10) {
    return res.status(400).json({ error: "⚠️ Minimum amount is 10 Ksh." });
  }

  let responseMessage = "";
  let transactionStatus = "pending";

  if (paymentMethod === PAYMENT_METHODS.MPESA) {
    responseMessage = "📲 M-Pesa STK Push sent! Approve payment...";
    transactionStatus = "processing";
  } else if (paymentMethod === PAYMENT_METHODS.BANK) {
    responseMessage = "🏦 Bank payment processing...";
    transactionStatus = "processing";
  } else {
    return res.status(400).json({ error: "⚠️ Invalid payment method!" });
  }

  // 🔹 Generate a random token
  const token = generateToken();

  try {
    // 🔹 Save transaction to PostgreSQL
    const newTransaction = await pool.query(
      "INSERT INTO transactions (meter_number, amount, phone_number, payment_method, token, status, timestamp) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *",
      [meterNumber, amount, phoneNumber, paymentMethod, token, transactionStatus]
    );

    return res.json({
      message: responseMessage,
      token,
      transaction: newTransaction.rows[0],
    });
  } catch (error) {
    console.error("❌ Error saving transaction:", error);
    return res.status(500).json({ error: "❌ Server error while processing transaction" });
  }
});

// ✅ Route to fetch all transactions
app.get("/transactions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transactions ORDER BY timestamp DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    res.status(500).json({ error: "❌ Error fetching transactions" });
  }
});

// ✅ Route to fetch payment history
app.get("/payment-history", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM payments ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching payment history:", error);
    res.status(500).json({ error: "❌ Failed to fetch payment history." });
  }
});

// ✅ Route to fetch tokens
app.get("/tokens", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM token_purchases ORDER BY purchase_date DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching tokens:", error);
    res.status(500).json({ error: "❌ Error fetching tokens" });
  }
});

// ✅ Authentication & Dashboard Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("✅ Routes initialized successfully!");
});
