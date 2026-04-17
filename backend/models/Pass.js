const mongoose = require("mongoose");

const passSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    passType: {
      type: String,
      enum: ["student", "monthly", "senior", "daily"],
      required: true
    },

    name: {
      type: String,
      required: true
    },

    age: {
      type: Number
    },

    college: {
      type: String
    },

    route: {
      type: String
    },

    // ✅ FIXED (safe default added)
    documents: {
      type: [String],
      default: []
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    passNumber: {
      type: String,
      unique: true,
      required: true
    },

    // 🔥 QR CODE STORAGE
    qrCode: {
      type: String
    },

    isUsed: {
      type: Boolean,
      default: false
    },

    // 🔥 VALIDITY
    validFrom: {
      type: Date
    },

    validTo: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Pass", passSchema);