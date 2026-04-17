const express = require("express");
const router = express.Router();

const { createPass, approvePass, rejectPass } = require("../controllers/passController");
const { protect } = require("../middleware/auth");
const upload = require("../config/multer");
const Pass = require("../models/Pass");

// ✅ CREATE PASS (WITH FILE UPLOAD)

router.post(
  "/apply",
  protect,   
  upload.array("documents", 5),
  createPass
);


// ✅ APPROVE / REJECT
router.put("/approve/:id", approvePass);
router.put("/reject/:id", rejectPass);

router.get("/all", async (req, res) => {
  const passes = await Pass.find();
  res.json({ passes });
});

// ✅ GET MY PASSES
router.get("/my", protect, async (req, res) => {
  try {
    const passes = await Pass.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      passes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching passes",
    });
  }
});

// ✅ ADMIN: GET ALL PASSES
router.get("/all", async (req, res) => {
  try {
    const passes = await Pass.find().sort({ createdAt: -1 });

    res.json(passes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;