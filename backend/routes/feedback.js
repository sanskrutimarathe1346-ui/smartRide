const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Feedback = require('../models/Feedback');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Private (Passenger)
router.post('/', protect, [
  body('type').isIn(['complaint', 'suggestion', 'appreciation', 'query']).withMessage('Invalid feedback type'),
  body('category').isIn([
    'driver-behavior', 'conductor-behavior', 'cleanliness', 'punctuality',
    'safety', 'overcrowding', 'route-issue', 'app-issue', 'payment-issue', 'other'
  ]).withMessage('Invalid category'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  validateRequest
], async (req, res) => {
  try {
    const {
      type,
      category,
      subject,
      description,
      busId,
      routeId,
      ticketId,
      rating,
      location,
      isAnonymous,
      contactPreference,
      incidentDate
    } = req.body;

    const feedback = await Feedback.create({
      passenger: req.user.id,
      type,
      category,
      subject,
      description,
      bus: busId,
      route: routeId,
      ticket: ticketId,
      rating,
      location,
      isAnonymous: isAnonymous || false,
      contactPreference: contactPreference || 'app',
      incidentDate: incidentDate || new Date()
    });

    await feedback.populate([
      { path: 'bus', select: 'busNumber' },
      { path: 'route', select: 'routeNumber routeName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
});

// @route   GET /api/feedback/my-feedback
// @desc    Get user's feedback
// @access  Private (Passenger)
router.get('/my-feedback', protect, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;

    const query = { passenger: req.user.id };
    if (status) query.status = status;
    if (type) query.type = type;

    const feedbacks = await Feedback.find(query)
      .populate('bus', 'busNumber')
      .populate('route', 'routeNumber routeName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Feedback.countDocuments(query);

    res.json({
      success: true,
      feedbacks,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
});

// @route   GET /api/feedback/:id
// @desc    Get single feedback
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('passenger', 'name email phone')
      .populate('bus', 'busNumber registrationNumber')
      .populate('route', 'routeNumber routeName')
      .populate('assignedTo', 'name email')
      .populate('adminResponse.respondedBy', 'name')
      .populate('resolutionDetails.resolvedBy', 'name');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check access
    if (feedback.passenger._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this feedback'
      });
    }

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
});

// @route   GET /api/feedback/admin/all
// @desc    Get all feedback (Admin)
// @access  Private (Admin)
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, type, category, priority, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const feedbacks = await Feedback.find(query)
      .populate('passenger', 'name email phone')
      .populate('bus', 'busNumber')
      .populate('route', 'routeNumber routeName')
      .populate('assignedTo', 'name')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Feedback.countDocuments(query);

    res.json({
      success: true,
      feedbacks,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
});

// @route   PUT /api/feedback/:id/assign
// @desc    Assign feedback to admin (Admin)
// @access  Private (Admin)
router.put('/:id/assign', protect, authorize('admin'), [
  body('adminId').notEmpty().withMessage('Admin ID is required'),
  validateRequest
], async (req, res) => {
  try {
    const { adminId } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await feedback.assignTo(adminId);

    res.json({
      success: true,
      message: 'Feedback assigned successfully',
      feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning feedback',
      error: error.message
    });
  }
});

// @route   PUT /api/feedback/:id/respond
// @desc    Respond to feedback (Admin)
// @access  Private (Admin)
router.put('/:id/respond', protect, authorize('admin'), [
  body('message').trim().notEmpty().withMessage('Response message is required'),
  validateRequest
], async (req, res) => {
  try {
    const { message } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await feedback.respond(req.user.id, message);

    res.json({
      success: true,
      message: 'Response sent successfully',
      feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error responding to feedback',
      error: error.message
    });
  }
});

// @route   PUT /api/feedback/:id/resolve
// @desc    Resolve feedback (Admin)
// @access  Private (Admin)
router.put('/:id/resolve', protect, authorize('admin'), [
  body('message').trim().notEmpty().withMessage('Resolution message is required'),
  body('actionTaken').trim().notEmpty().withMessage('Action taken is required'),
  validateRequest
], async (req, res) => {
  try {
    const { message, actionTaken } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await feedback.resolve(req.user.id, message, actionTaken);

    res.json({
      success: true,
      message: 'Feedback resolved successfully',
      feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resolving feedback',
      error: error.message
    });
  }
});

// @route   GET /api/feedback/statistics
// @desc    Get feedback statistics (Admin)
// @access  Private (Admin)
router.get('/admin/statistics', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const stats = await Feedback.getStatistics(start, end);

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

module.exports = router;
