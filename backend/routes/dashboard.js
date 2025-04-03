// routes/dashboard.js

const express = require("express");
const pool = require("../db"); // or wherever you have your database connection

const router = express.Router();

router.get("/dashboard-data", async (req, res) => {
  try {
    // Replace with actual queries to fetch consumption, billing, payment data
    const consumptionData = await pool.query("SELECT * FROM consumption");
    const billingData = await pool.query("SELECT * FROM billing");
    const paymentData = await pool.query("SELECT * FROM payments");

    // Sending the data as response
    res.json({
      consumption: consumptionData.rows,
      billing: billingData.rows,
      payments: paymentData.rows,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

module.exports = router;
