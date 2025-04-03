const mongoose = require("mongoose");

const TokenTransactionSchema = new mongoose.Schema({
  meterNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  token: { type: String, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TokenTransaction", TokenTransactionSchema);
