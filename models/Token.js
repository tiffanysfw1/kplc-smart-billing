const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  token: { type: String, required: true, unique: true },
  units: { type: Number, required: true },
  status: { type: String, enum: ["valid", "used"], default: "valid" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Token", tokenSchema);

