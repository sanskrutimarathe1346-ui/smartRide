const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Pass = require('../models/Pass');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

// @route   POST /api/passes/purchase
// @desc    Purchase a new pass
// @access  Private (Passenger)
router.post('/purchase', protect, [
  body('passType').isIn(['daily', 'weekly', 'monthly', 'quarterly', 'annual']).withMessage('Invalid pass type'),
  body('category').optional().isIn(['general', 'student', 'senior-citizen', 'disabled', 'employee']),
  validateRequest
], async (req, res) => {
  try {
    const { passType, category, routes, isUnlimitedRoutes } = req.body;

    // Calculate pass price
    const pricing = Pass.calculatePassPrice(passType, category || 'general');

    // Set validity dates
    const now = new Date();
    const validFrom = now;
    let validUntil = new Date(now);

    switch(passType) {
      case 'daily':
        validUntil.setDate(validUntil.getDate() + 1);
        break;
      case 'weekly':
        validUntil.setDate(validUntil.getDate() + 7);
        break;
      case 'monthly':
        validUntil.setMonth(validUntil.getMonth() + 1);
        break;
      case 'quarterly':
        validUntil.setMonth(validUntil.getMonth() + 3);
        break;
      case 'annual':
        validUntil.setFullYear(validUntil.getFullYear() + 1);
        break;
    }

    // Create pass
    const pass = await Pass.create({
      passenger: req.user.id,
      passType,
      category: category || 'general',
      routes: routes || [],
      isUnlimitedRoutes: isUnlimitedRoutes !== false,
      validFrom,
      validUntil,
      amount: pricing.basePrice,
      discount: pricing.discount,
      finalAmount: pricing.finalPrice,
      paymentStatus: 'completed' // In real app, pending until payment
    });

    await pass.populate('routes', 'routeNumber routeName');

    res.status(201).json({
      success: true,
      message: 'Pass purchased successfully',
      pass
    });
  } catch (error) {
    console.error('Pass purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Error purchasing pass',
      error: error.message
    });
  }
});

// @route   GET /api/passes/my-passes
// @desc    Get all passes for logged in user
// @access  Private (Passenger)
router.get('/my-passes', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { passenger: req.user.id };
    if (status) {
      query.status = status;
    }

    const passes = await Pass.find(query)
      .populate('routes', 'routeNumber routeName')
      .sort({ purchaseDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Pass.countDocuments(query);

    res.json({
      success: true,
      passes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching passes',
      error: error.message
    });
  }
});

// @route   GET /api/passes/active
// @desc    Get active pass for user
// @access  Private (Passenger)
router.get('/active', protect, async (req, res) => {
  try {
    const now = new Date();
    const activePass = await Pass.findOne({
      passenger: req.user.id,
      status: 'active',
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    }).populate('routes', 'routeNumber routeName');

    if (!activePass) {
      return res.status(404).json({
        success: false,
        message: 'No active pass found'
      });
    }

    res.json({
      success: true,
      pass: activePass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active pass',
      error: error.message
    });
  }
});

// @route   GET /api/passes/:id
// @desc    Get single pass by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id)
      .populate('routes')
      .populate('passenger', 'name email phone');

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    // Check if user has access
    if (pass.passenger._id.toString() !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'conductor') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this pass'
      });
    }

    res.json({
      success: true,
      pass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pass',
      error: error.message
    });
  }
});

// @route   POST /api/passes/:id/verify
// @desc    Verify and record pass usage (Conductor)
// @access  Private (Conductor, Admin)
router.post('/:id/verify', protect, authorize('conductor', 'admin'), [
  body('busId').notEmpty().withMessage('Bus ID is required'),
  body('routeId').notEmpty().withMessage('Route ID is required'),
  body('boardingStop').notEmpty().withMessage('Boarding stop is required'),
  validateRequest
], async (req, res) => {
  try {
    const { busId, routeId, boardingStop } = req.body;

    const pass = await Pass.findById(req.params.id)
      .populate('passenger', 'name phone');

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    // Check if pass is valid
    if (!pass.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Pass is not valid',
        status: pass.status,
        validUntil: pass.validUntil
      });
    }

    // Record usage
    await pass.recordUsage(busId, routeId, req.user.id, boardingStop);

    res.json({
      success: true,
      message: 'Pass verified successfully',
      pass: {
        passNumber: pass.passNumber,
        passenger: pass.passenger,
        passType: pass.passType,
        category: pass.category,
        validUntil: pass.validUntil,
        usageCount: pass.usageCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying pass',
      error: error.message
    });
  }
});

// @route   POST /api/passes/:id/renew
// @desc    Renew a pass
// @access  Private (Passenger)
router.post('/:id/renew', protect, async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id);

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    // Check ownership
    if (pass.passenger.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to renew this pass'
      });
    }

    // Calculate renewal price
    const pricing = Pass.calculatePassPrice(pass.passType, pass.category);

    // Renew pass
    await pass.renewPass(pass.passType, pricing.finalPrice);

    res.json({
      success: true,
      message: 'Pass renewed successfully',
      pass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error renewing pass',
      error: error.message
    });
  }
});

// @route   PUT /api/passes/:id/cancel
// @desc    Cancel pass
// @access  Private (Passenger)
router.put('/:id/cancel', protect, [
  body('reason').optional().trim(),
  validateRequest
], async (req, res) => {
  try {
    const { reason } = req.body;

    const pass = await Pass.findById(req.params.id);

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    // Check ownership
    if (pass.passenger.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this pass'
      });
    }

    // Check if already cancelled
    if (pass.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Pass is already cancelled'
      });
    }

    await pass.cancelPass(reason || 'Cancelled by user');

    res.json({
      success: true,
      message: 'Pass cancelled successfully',
      refundAmount: pass.refundAmount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling pass',
      error: error.message
    });
  }
});

// @route   GET /api/passes/pricing
// @desc    Get pass pricing information
// @access  Public
router.get('/pricing/all', async (req, res) => {
  try {
    const passTypes = ['daily', 'weekly', 'monthly', 'quarterly', 'annual'];
    const categories = ['general', 'student', 'senior-citizen', 'disabled', 'employee'];

    const pricing = {};

    passTypes.forEach(type => {
      pricing[type] = {};
      categories.forEach(category => {
        pricing[type][category] = Pass.calculatePassPrice(type, category);
      });
    });

    res.json({
      success: true,
      pricing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pricing',
      error: error.message
    });
  }
});

module.exports = router;
