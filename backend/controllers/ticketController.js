const Ticket = require("../models/Ticket");

// ✅ CREATE TICKET
exports.createTicket = async (req, res) => {
  try {
    const {
      fromStop,
      toStop,
      fare,
      travelDate
    } = req.body;

    if (!fromStop || !toStop || !fare || !travelDate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ VALIDITY (same day ticket)
    const validUntil = new Date(travelDate);
    validUntil.setHours(23, 59, 59, 999);

    const ticket = await Ticket.create({
      passenger: req.user._id, // IMPORTANT (your schema uses passenger, not user)
      route: null, // keep null if not using routes
      fromStop,
      toStop,
      fare,
      totalAmount: fare,
      travelDate,
      validUntil,
      paymentStatus: "completed"
    });

    res.status(201).json({
      success: true,
      ticket,
    });

  } catch (error) {
    console.error("CREATE TICKET ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Ticket creation failed",
    });
  }
};