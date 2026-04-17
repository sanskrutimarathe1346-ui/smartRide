const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeNumber: {
    type: String,
    required: [true, 'Please provide route number'],
    unique: true,
    trim: true,
    uppercase: true
  },
  routeName: {
    type: String,
    required: [true, 'Please provide route name'],
    trim: true
  },
  startPoint: {
    name: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  endPoint: {
    name: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  stops: [{
    stopName: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    sequence: {
      type: Number,
      required: true
    },
    estimatedArrivalTime: {
      type: Number, // in minutes from start
      required: true
    },
    facilities: {
      hasShelter: {
        type: Boolean,
        default: false
      },
      hasBench: {
        type: Boolean,
        default: false
      },
      hasDisplayBoard: {
        type: Boolean,
        default: false
      }
    }
  }],
  distance: {
    type: Number, // in kilometers
    required: true
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  baseFare: {
    type: Number,
    required: true,
    default: 10
  },
  farePerKm: {
    type: Number,
    required: true,
    default: 2
  },
  operatingHours: {
    firstBus: {
      type: String, // "05:30"
      required: true
    },
    lastBus: {
      type: String, // "23:00"
      required: true
    }
  },
  frequency: {
    type: Number, // in minutes
    required: true,
    default: 15
  },
  busType: {
    type: String,
    enum: ['ordinary', 'express', 'ac', 'semi-luxury', 'luxury'],
    default: 'ordinary'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  polyline: {
    type: String, // Encoded polyline for Google Maps
    default: null
  },
  averagePassengersPerDay: {
    type: Number,
    default: 0
  },
  popularityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  landmarks: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for route searches
routeSchema.index({ routeNumber: 1 });
routeSchema.index({ 'startPoint.name': 1, 'endPoint.name': 1 });

// Virtual for total stops
routeSchema.virtual('totalStops').get(function() {
  return this.stops.length + 2; // including start and end points
});

// Method to calculate fare between two stops
routeSchema.methods.calculateFare = function(fromStopIndex, toStopIndex) {
  if (fromStopIndex < 0 || toStopIndex > this.stops.length || fromStopIndex >= toStopIndex) {
    throw new Error('Invalid stop indices');
  }
  
  // Simple calculation based on number of stops
  const stopCount = toStopIndex - fromStopIndex;
  const distanceTraveled = (this.distance / this.stops.length) * stopCount;
  
  return Math.ceil(this.baseFare + (distanceTraveled * this.farePerKm));
};

// Method to get stop by name
routeSchema.methods.getStopByName = function(stopName) {
  return this.stops.find(stop => 
    stop.stopName.toLowerCase() === stopName.toLowerCase()
  );
};

// Method to get ETA at a particular stop
routeSchema.methods.getETAAtStop = function(stopSequence) {
  const stop = this.stops.find(s => s.sequence === stopSequence);
  return stop ? stop.estimatedArrivalTime : null;
};

const Route = mongoose.model('Route', routeSchema);

module.exports = Route;
