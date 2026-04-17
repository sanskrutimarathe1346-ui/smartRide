const mongoose = require('mongoose');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    uppercase: true,
    default: ""
  },

  // 🔥 NEW FIELD (added)
  qrToken: {
    type: String,
    unique: true
  },

  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    default: null
  },

  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    default: null
  },

  fromStop: {
    type: String,
    required: true
  },

  toStop: {
    type: String,
    required: true
  },

  boardingPoint: {
    latitude: Number,
    longitude: Number
  },

  fare: {
    type: Number,
    required: true,
    min: 0
  },

  passengerCount: {
    type: Number,
    default: 1,
    min: 1,
    max: 6
  },

  totalAmount: {
    type: Number,
    required: true
  },

  bookingDate: {
    type: Date,
    default: Date.now
  },

  travelDate: {
    type: Date,
    required: true
  },

  validUntil: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ['active', 'used', 'expired', 'cancelled'],
    default: 'active'
  },

  qrCode: {
    type: String,
    default: ""
  },

  qrCodeData: {
    type: String,
    default: ""
  },

  paymentMethod: {
    type: String,
    enum: ['razorpay', 'wallet', 'cash', 'card'],
    default: 'razorpay'
  },

  paymentId: {
    type: String,
    default: null
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },

  scanInfo: {
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    scanTime: {
      type: Date,
      default: null
    },
    scanLocation: {
      latitude: Number,
      longitude: Number
    }
  },

  discount: {
    type: Number,
    default: 0
  },

  discountReason: {
    type: String,
    default: null
  },

  cancellationReason: {
    type: String,
    default: null
  },

  refundAmount: {
    type: Number,
    default: 0
  },

  isRoundTrip: {
    type: Boolean,
    default: false
  },

  notes: {
    type: String,
    maxlength: 200
  }

}, {
  timestamps: true
});


// ─── PRE SAVE ─────────────────────────────────────────
ticketSchema.pre('save', async function(next) {
  if (this.isNew) {

    // 🔥 Ticket number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.ticketNumber = `TKT-${dateStr}-${random}`;

    // 🔥 Generate QR TOKEN (NEW)
    this.qrToken = uuidv4();

    // 🔥 NEW QR FORMAT (VERY IMPORTANT)
    const payload = JSON.stringify({
      type: "ticket",
      token: this.qrToken
    });

    this.qrCodeData = payload;

    try {
      this.qrCode = await QRCode.toDataURL(payload);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  next();
});


// ─── INDEXES ─────────────────────────────────────────
ticketSchema.index({ passenger: 1, bookingDate: -1 });
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ status: 1 });


// ─── METHODS ─────────────────────────────────────────
ticketSchema.methods.markAsUsed = function(conductorId, location) {
  this.status = 'used';
  this.scanInfo = {
    scannedBy: conductorId,
    scanTime: new Date(),
    scanLocation: location
  };
  return this.save();
};

ticketSchema.methods.cancelTicket = function(reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;

  if (new Date() < this.travelDate) {
    this.refundAmount = this.totalAmount * 0.9;
  }

  return this.save();
};

ticketSchema.methods.isValid = function() {
  return this.status === 'active' &&
         new Date() >= this.travelDate &&
         new Date() <= this.validUntil;
};


// ─── STATIC ─────────────────────────────────────────
ticketSchema.statics.markExpiredTickets = async function() {
  const now = new Date();
  await this.updateMany(
    { status: 'booked', validUntil: { $lt: now } },
    { status: 'expired' }
  );
};

console.log("🔥 NEW QR LOGIC RUNNING");
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;