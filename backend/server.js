const express = require("express");
const cors = require("cors");
const pool = require("./db"); // Import database connection
const authRoutes = require("./routes/auth"); // Import authentication routes
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json()); // Replaces bodyParser.json()

// ✅ Root route (to check if the server is running)
app.get("/", (req, res) => {
  res.send("🚀 KPLC Smart Billing API is running...");
});

// 🔹 Helper function to generate a random 12-digit token
const generateToken = () => Math.floor(100000000000 + Math.random() * 900000000000).toString();

// Constants for payment methods
const PAYMENT_METHODS = {
  MPESA: "mpesa",
  BANK: "bank",
};

// ✅ Route to buy tokens
app.post("/buy-tokens", (req, res) => {
  const { meterNumber, amount, phoneNumber, paymentMethod } = req.body;

  // 🔹 Validate input
  if (!meterNumber || !amount || !phoneNumber || !paymentMethod) {
    return res.status(400).json({ error: "⚠️ All fields are required!" });
  }

  if (amount < 10) {
    return res.status(400).json({ error: "⚠️ Minimum amount is 10 Ksh." });
  }

  let responseMessage = "";
  let transactionStatus = "pending";

  // 🔹 Simulated Payment Processing
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

  // 🔹 Save transaction (Replace this with a database later)
  const newTransaction = {
    meterNumber,
    amount,
    phoneNumber,
    paymentMethod,
    token,
    status: transactionStatus,
    timestamp: new Date().toISOString(),
  };

  // Instead of using an array, store this in a database.
  // createTransaction(newTransaction); 

  return res.json({
    message: responseMessage,
    token,
    transaction: newTransaction,
  });
});

// ✅ Route to fetch all transactions (for tracking & reports)
app.get("/transactions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transactions");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    res.status(500).json({ error: "❌ Error fetching transactions" });
  }
});

// Example backend route in Express.js (Node.js)
app.get("/payment-history", async (req, res) => {
  try {
    const history = await Payment.find(); // Assuming you use a database model named "Payment"
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payment history." });
  }
});

app.get("/tokens", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM token_purchases");
    res.json(result.rows);  // Send the list of token purchases
  } catch (error) {
    console.error("Error fetching tokens:", error);
    res.status(500).send("Error fetching tokens");
  }
});

// ✅ Authentication routes
app.use("/api/auth", authRoutes);
app.use("/", dashboardRoutes);

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("✅ Dashboard routes loaded");
});
