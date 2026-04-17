const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  phone: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  role: {
    type: String,
    enum: ["passenger", "admin", "driver", "conductor"],
    default: "passenger"
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

/* 🔐 HASH PASSWORD BEFORE SAVE */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // ✅ IMPORTANT

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* 🔑 COMPARE PASSWORD */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);