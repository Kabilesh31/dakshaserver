const Staff = require("../model/staffModal");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Staff login
exports.staffLoginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const staff = await Staff.findOne({ email: email.toLowerCase(), isDeleted: false }).select("+password");
    if (!staff) return res.status(401).json({ message: "Invalid email or password" });

    if (staff.staffStatus !== "active") return res.status(403).json({ message: "Staff account inactive" });

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: staff._id, role: "staff" }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        mobile: staff.mobile,
        type: staff.type,
        staffStatus: staff.staffStatus,
        dutyStatus: staff.dutyStatus,
        img: staff.img,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get logged-in staff profile
exports.getMyProfile = async (req, res) => {
  try {
    const staff = req.staff; // from isStaffAuthenticated middleware
    res.status(200).json({ message: "Staff profile fetched successfully", staff });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
