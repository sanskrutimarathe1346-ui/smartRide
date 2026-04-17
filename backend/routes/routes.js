const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Route = require('../models/Route');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

// @route   GET /api/routes
// @desc    Get all routes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { isActive, busType, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (typeof isActive !== 'undefined') {
      query.isActive = isActive === 'true';
    }
    if (busType) {
      query.busType = busType;
    }
    if (search) {
      query.$or = [
        { routeNumber: new RegExp(search, 'i') },
        { routeName: new RegExp(search, 'i') },
        { 'startPoint.name': new RegExp(search, 'i') },
        { 'endPoint.name': new RegExp(search, 'i') }
      ];
    }

    const routes = await Route.find(query)
      .sort({ routeNumber: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Route.countDocuments(query);

    res.json({
      success: true,
      routes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching routes',
      error: error.message
    });
  }
});

// @route   GET /api/routes/:id
// @desc    Get single route by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching route',
      error: error.message
    });
  }
});

// @route   POST /api/routes
// @desc    Create new route (Admin)
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), [
  body('routeNumber').notEmpty().withMessage('Route number is required'),
  body('routeName').notEmpty().withMessage('Route name is required'),
  body('startPoint').notEmpty().withMessage('Start point is required'),
  body('endPoint').notEmpty().withMessage('End point is required'),
  body('distance').isFloat({ min: 0 }).withMessage('Valid distance is required'),
  body('estimatedDuration').isInt({ min: 0 }).withMessage('Valid duration is required'),
  validateRequest
], async (req, res) => {
  try {
    const {
      routeNumber,
      routeName,
      startPoint,
      endPoint,
      stops,
      distance,
      estimatedDuration,
      baseFare,
      farePerKm,
      operatingHours,
      frequency,
      busType,
      description
    } = req.body;

    // Check if route already exists
    const existingRoute = await Route.findOne({ routeNumber });
    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: 'Route with this number already exists'
      });
    }

    const route = await Route.create({
      routeNumber,
      routeName,
      startPoint,
      endPoint,
      stops: stops || [],
      distance,
      estimatedDuration,
      baseFare: baseFare || 10,
      farePerKm: farePerKm || 2,
      operatingHours: operatingHours || { firstBus: '05:30', lastBus: '23:00' },
      frequency: frequency || 15,
      busType: busType || 'ordinary',
      description
    });

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating route',
      error: error.message
    });
  }
});

// @route   PUT /api/routes/:id
// @desc    Update route (Admin)
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      message: 'Route updated successfully',
      route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating route',
      error: error.message
    });
  }
});

// @route   DELETE /api/routes/:id
// @desc    Delete route (Admin)
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting route',
      error: error.message
    });
  }
});

// @route   GET /api/routes/:id/stops
// @desc    Get all stops for a route
// @access  Public
router.get('/:id/stops', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      stops: route.stops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stops',
      error: error.message
    });
  }
});

// @route   POST /api/routes/search
// @desc    Search routes by start and end points
// @access  Public
router.post('/search', [
  body('from').notEmpty().withMessage('From location is required'),
  body('to').notEmpty().withMessage('To location is required'),
  validateRequest
], async (req, res) => {
  try {
    const { from, to } = req.body;

    const routes = await Route.find({
      $or: [
        {
          'startPoint.name': new RegExp(from, 'i'),
          'endPoint.name': new RegExp(to, 'i')
        },
        {
          'stops.stopName': new RegExp(from, 'i'),
          'stops.stopName': new RegExp(to, 'i')
        }
      ],
      isActive: true
    });

    res.json({
      success: true,
      count: routes.length,
      routes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching routes',
      error: error.message
    });
  }
});

module.exports = router;
