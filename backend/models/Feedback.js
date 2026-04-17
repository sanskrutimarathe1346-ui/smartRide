const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['complaint', 'suggestion', 'appreciation', 'query'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'driver-behavior',
      'conductor-behavior',
      'cleanliness',
      'punctuality',
      'safety',
      'overcrowding',
      'route-issue',
      'app-issue',
      'payment-issue',
      'other'
    ],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    default: null
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    default: null
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    default: null
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  attachments: [{
    url: String,
    type: {
      type: String,
      enum: ['image', 'document']
    }
  }],
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  adminResponse: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  resolutionDetails: {
    message: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    actionTaken: String
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  contactPreference: {
    type: String,
    enum: ['email', 'phone', 'app', 'none'],
    default: 'app'
  },
  incidentDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
feedbackSchema.index({ passenger: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, priority: -1 });
feedbackSchema.index({ type: 1, category: 1 });

// Method to assign feedback to admin
feedbackSchema.methods.assignTo = function(adminId) {
  this.assignedTo = adminId;
  this.status = 'in-progress';
  return this.save();
};

// Method to respond to feedback
feedbackSchema.methods.respond = function(adminId, message) {
  this.adminResponse = {
    message: message,
    respondedBy: adminId,
    respondedAt: new Date()
  };
  return this.save();
};

// Method to resolve feedback
feedbackSchema.methods.resolve = function(adminId, message, actionTaken) {
  this.status = 'resolved';
  this.resolutionDetails = {
    message: message,
    resolvedBy: adminId,
    resolvedAt: new Date(),
    actionTaken: actionTaken
  };
  return this.save();
};

// Method to close feedback
feedbackSchema.methods.close = function() {
  this.status = 'closed';
  return this.save();
};

// Static method to get feedback statistics
feedbackSchema.statics.getStatistics = async function(startDate, endDate) {
  const match = {};
  if (startDate && endDate) {
    match.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $facet: {
        byType: [
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ],
        byCategory: [
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        averageRating: [
          { $match: { rating: { $ne: null } } },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]
      }
    }
  ]);
  
  return stats[0];
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
