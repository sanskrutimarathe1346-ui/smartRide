const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const Ticket = require('../models/Ticket');
const Route = require('../models/Route');

const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');


// =========================================
// ✅ BOOK TICKET
// =========================================
router.post('/book', protect, [
  body('routeId').notEmpty().withMessage('Route ID is required'),
  body('fromStop').notEmpty().withMessage('Boarding stop is required'),
  body('toStop').notEmpty().withMessage('Destination stop is required'),
  body('passengerCount').isInt({ min: 1, max: 6 }),
  body('travelDate').notEmpty(),
  validateRequest
], async (req, res) => {
  try {
    const { routeId, fromStop, toStop, passengerCount, travelDate, fare } = req.body;

    // 🔍 Validate route
    const route = null;
    
    // 💰 Fare calculation
    let calculatedFare = fare;
    if (!calculatedFare) {
      calculatedFare = route.baseFare + (route.distance * route.farePerKm);
    }

    const totalAmount = calculatedFare * passengerCount;

    // ⏱️ Validity (3 hours)
    const travelDateTime = new Date(travelDate);
    const validUntil = new Date(travelDateTime.getTime() + 3 * 60 * 60 * 1000);

    // 🎫 CREATE TICKET
    const ticket = await Ticket.create({
      passenger: req.user.id,
      route: null,
      fromStop,
      toStop,
      fare: calculatedFare,
      passengerCount,
      totalAmount,
      travelDate: travelDateTime,
      validUntil,
      paymentStatus: 'completed',
      status: 'active' // ✅ IMPORTANT
    });

    // 🔄 Populate route info
    await ticket.populate('route', 'routeNumber routeName');

    res.status(201).json({
      success: true,
      message: 'Ticket booked successfully',
      ticket
    });

  } catch (error) {
    console.error('Ticket booking error:', error);

    res.status(500).json({
      success: false,
      message: 'Error booking ticket',
      error: error.message
    });
  }
});


// =========================================
// ✅ GET MY TICKETS (FOR DASHBOARD)
// =========================================
router.get('/my', protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ passenger: req.user.id })
      .populate('route', 'routeNumber routeName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tickets
    });

  } catch (error) {
    console.error('Fetch tickets error:', error);

    res.status(500).json({
      success: false,
      message: 'Error fetching tickets'
    });
  }
});


// =========================================
// ✅ GET SINGLE TICKET
// =========================================
router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('route')
      .populate('bus')
      .populate('passenger', 'name email phone');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // 🔒 Authorization check
    if (ticket.passenger._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      ticket
    });

  } catch (error) {
    console.error('Single ticket error:', error);

    res.status(500).json({
      success: false,
      message: 'Error fetching ticket'
    });
  }
});


// =========================================
// ✅ VERIFY (SCAN BY CONDUCTOR)
// =========================================
router.post('/:id/verify', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (!ticket.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Ticket not valid'
      });
    }

    await ticket.markAsUsed(req.user.id);

    res.json({
      success: true,
      message: 'Ticket marked as used',
      ticket
    });

  } catch (error) {
    console.error('Verify error:', error);

    res.status(500).json({
      success: false,
      message: 'Error verifying ticket'
    });
  }
});

module.exports = router;