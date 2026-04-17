const Pass = require("../models/Pass");
const QRCode = require("qrcode");

// ✅ CREATE PASS
exports.createPass = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { passType, name, college, route, age } = req.body;

    // ✅ BASIC VALIDATION
    if (!passType || !name) {
      return res.status(400).json({
        success: false,
        message: "passType and name are required",
      });
    }

    // ✅ UNIQUE PASS NUMBER
    const passNumber = "PASS-" + Date.now();

    let passData = {
      user: req.user?._id || null,
      passType,
      name,
      passNumber,
      status: "pending",
    };

    // ✅ HANDLE PASS TYPES
    if (passType === "student") {
      passData.college = college || "";
    }

    if (passType === "daily" || passType === "monthly") {
      passData.route = route || "";
    }

    if (passType === "senior") {
      passData.age = age || "";
    }

    // 🔥 DOCUMENTS
    if (req.files && req.files.length > 0) {
      passData.documents = req.files.map((file) => file.path);
    }

    const newPass = await Pass.create(passData);

    res.status(201).json({
      success: true,
      message: "Pass request submitted successfully",
      pass: newPass,
    });

  } catch (error) {
    console.error("CREATE PASS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create pass",
      error: error.message,
    });
  }
};

// ✅ APPROVE PASS (UPDATED QR FORMAT)
exports.approvePass = async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id);

    if (!pass) {
      return res.status(404).json({ message: "Pass not found" });
    }

    // 🔥 NEW QR FORMAT (JSON)
    const payload = JSON.stringify({
      type: "pass",
      token: pass.passNumber
    });

    const qrData = await QRCode.toDataURL(payload);

    pass.status = "approved";
    pass.qrCode = qrData;
    pass.approvedAt = new Date();

    await pass.save();

    res.json({
      success: true,
      message: "Pass approved",
      pass
    });

  } catch (error) {
    console.error("APPROVE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error approving pass"
    });
  }
};

// ❌ REJECT PASS
exports.rejectPass = async (req, res) => {
  try {
    const pass = await Pass.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    res.json({
      success: true,
      message: "Pass rejected",
      pass
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error rejecting pass"
    });
  }
};