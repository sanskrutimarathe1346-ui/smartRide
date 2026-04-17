const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

// @route   GET /api/buses
// @desc    Get all buses
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, routeId, busType, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (routeId) query.route = routeId;
    if (busType) query.busType = busType;

    const buses = await Bus.find(query)
      .populate('route', 'routeNumber routeName')
      .populate('driver', 'name phone')
      .populate('conductor', 'name phone')
      .sort({ busNumber: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Bus.countDocuments(query);

    res.json({
      success: true,
      buses,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching buses',
      error: error.message
    });
  }
});

// @route   GET /api/buses/live
// @desc    Get live bus locations
// @access  Public
router.get('/live', async (req, res) => {
  try {
    const { routeId } = req.query;

    const query = { 
      status: 'active',
      'currentLocation.latitude': { $ne: null },
      'currentLocation.longitude': { $ne: null }
    };

    if (routeId) {
      query.route = routeId;
    }

    const buses = await Bus.find(query)
      .populate('route', 'routeNumber routeName')
      .populate('driver', 'name phone')
      .select('busNumber route currentLocation currentPassengers capacity busType features');

    res.json({
      success: true,
      count: buses.length,
      buses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching live buses',
      error: error.message
    });
  }
});

// @route   GET /api/buses/:id
// @desc    Get single bus by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('route')
      .populate('driver', 'name phone email')
      .populate('conductor', 'name phone email');

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    res.json({
      success: true,
      bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bus',
      error: error.message
    });
  }
});

// @route   POST /api/buses/update-location
// @desc    Update bus location (Driver)
// @access  Private (Driver)
router.post('/update-location', protect, authorize('driver', 'admin'), [
  body('busId').notEmpty().withMessage('Bus ID is required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  validateRequest
], async (req, res) => {
  try {
    const { busId, latitude, longitude } = req.body;

    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Verify driver is assigned to this bus
    if (req.user.role === 'driver' && bus.driver?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this bus location'
      });
    }

    await bus.updateLocation(latitude, longitude);

    // Emit socket event for real-time tracking (handled in server.js)
    if (req.app.get('io')) {
      req.app.get('io').emit('bus-location-update', {
        busId: bus._id,
        busNumber: bus.busNumber,
        location: {
          latitude,
          longitude
        },
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      location: bus.currentLocation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating location',
      error: error.message
    });
  }
});

// @route   PUT /api/buses/:id/passengers
// @desc    Update passenger count
// @access  Private (Driver, Conductor)
router.put('/:id/passengers', protect, authorize('driver', 'conductor', 'admin'), [
  body('count').isInt({ min: 0 }).withMessage('Valid passenger count is required'),
  validateRequest
], async (req, res) => {
  try {
    const { count } = req.body;

    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    await bus.updatePassengerCount(count);

    res.json({
      success: true,
      message: 'Passenger count updated',
      currentPassengers: bus.currentPassengers,
      occupancyPercentage: bus.occupancyPercentage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating passenger count',
      error: error.message
    });
  }
});

// @route   POST /api/buses
// @desc    Create new bus (Admin)
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), [
  body('busNumber').notEmpty().withMessage('Bus number is required'),
  body('registrationNumber').notEmpty().withMessage('Registration number is required'),
  body('routeId').notEmpty().withMessage('Route ID is required'),
  body('capacity').isInt({ min: 20, max: 100 }).withMessage('Valid capacity is required'),
  validateRequest
], async (req, res) => {
  try {
    const {
      busNumber,
      registrationNumber,
      routeId,
      capacity,
      busType,
      manufacturingYear,
      manufacturer,
      fuelType,
      features
    } = req.body;

    // Check if bus already exists
    const existingBus = await Bus.findOne({
      $or: [{ busNumber }, { registrationNumber }]
    });

    if (existingBus) {
      return res.status(400).json({
        success: false,
        message: 'Bus with this number or registration already exists'
      });
    }

    // Verify route exists
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    const bus = await Bus.create({
      busNumber,
      registrationNumber,
      route: routeId,
      capacity,
      busType: busType || 'ordinary',
      manufacturingYear,
      manufacturer,
      fuelType: fuelType || 'diesel',
      features: features || {}
    });

    await bus.populate('route', 'routeNumber routeName');

    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
      bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating bus',
      error: error.message
    });
  }
});

// @route   PUT /api/buses/:id
// @desc    Update bus (Admin)
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const updateFields = req.body;

    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('route driver conductor');

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    res.json({
      success: true,
      message: 'Bus updated successfully',
      bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating bus',
      error: error.message
    });
  }
});

// @route   DELETE /api/buses/:id
// @desc    Delete bus (Admin)
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    res.json({
      success: true,
      message: 'Bus deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting bus',
      error: error.message
    });
  }
});

// @route   GET /api/buses/route/:routeId
// @desc    Get buses by route
// @access  Public
router.get('/route/:routeId', async (req, res) => {
  try {
    const buses = await Bus.find({ route: req.params.routeId })
      .populate('route', 'routeNumber routeName')
      .populate('driver', 'name phone')
      .populate('conductor', 'name phone');

    res.json({
      success: true,
      count: buses.length,
      buses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching buses for route',
      error: error.message
    });
  }
});

module.exports = router;
