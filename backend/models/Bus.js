const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: [true, 'Please provide bus number'],
    unique: true,
    trim: true,
    uppercase: true
  },
  registrationNumber: {
    type: String,
    required: [true, 'Please provide registration number'],
    unique: true,
    trim: true,
    uppercase: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Please assign a route to the bus']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  conductor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide bus capacity'],
    min: [20, 'Minimum capacity is 20'],
    max: [100, 'Maximum capacity is 100']
  },
  busType: {
    type: String,
    enum: ['ordinary', 'express', 'ac', 'semi-luxury', 'luxury'],
    default: 'ordinary'
  },
  currentLocation: {
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    lastUpdated: {
      type: Date,
      default: null
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'breakdown'],
    default: 'inactive'
  },
  features: {
    hasAC: {
      type: Boolean,
      default: false
    },
    hasWifi: {
      type: Boolean,
      default: false
    },
    hasGPS: {
      type: Boolean,
      default: true
    },
    isWheelchairAccessible: {
      type: Boolean,
      default: false
    },
    hasCCTV: {
      type: Boolean,
      default: false
    }
  },
  manufacturingYear: {
    type: Number,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  fuelType: {
    type: String,
    enum: ['diesel', 'cng', 'electric', 'hybrid'],
    default: 'diesel'
  },
  lastMaintenanceDate: {
    type: Date
  },
  nextMaintenanceDate: {
    type: Date
  },
  mileage: {
    type: Number,
    default: 0
  },
  averageSpeed: {
    type: Number,
    default: 0
  },
  currentPassengers: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTripsCompleted: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  qrCode: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for geospatial queries
busSchema.index({ 'currentLocation.latitude': 1, 'currentLocation.longitude': 1 });

// Virtual for occupancy percentage
busSchema.virtual('occupancyPercentage').get(function() {
  return this.capacity > 0 ? (this.currentPassengers / this.capacity) * 100 : 0;
});

// Method to update location
busSchema.methods.updateLocation = function(latitude, longitude) {
  this.currentLocation = {
    latitude,
    longitude,
    lastUpdated: new Date()
  };
  return this.save();
};

// Method to update passenger count
busSchema.methods.updatePassengerCount = function(count) {
  this.currentPassengers = Math.max(0, Math.min(count, this.capacity));
  return this.save();
};

const Bus = mongoose.model('Bus', busSchema);

module.exports = Bus;
