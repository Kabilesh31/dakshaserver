const jwt = require("jsonwebtoken");
const Staff = require("../model/staffModal");
const User = require("../model/userModel")

exports.isStaffAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "staff") {
      return res.status(403).json({ message: "Access denied" });
    }

    const staff = await Staff.findById(decoded.id);

    if (!staff || staff.isDeleted) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    if (staff.staffStatus !== "active") {
      return res.status(403).json({ message: "Staff account is inactive" });
    }


    if (decoded.tokenVersion !== staff.tokenVersion) {
      return res.status(401).json({
        message: "Logged in from another device"
      });
    }

    req.staff = staff;
    req.staffId = staff._id;

    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

exports.protectAny = async (req, res, next) => {
  try {

    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try staff first
    const staff = await Staff.findById(decoded.id);

    if (staff) {

      // Check tokenVersion
      if (decoded.tokenVersion !== staff.tokenVersion) {
        return res.status(401).json({ message: "Logged in from another device" });
      }

      req.staff = staff;
      req.userType = "staff";

      return next();
    }

    // Otherwise check user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const sessionToken = req.headers["session-token"];

    if (user.sessionToken !== sessionToken) {
      return res.status(401).json({ message: "Logged in from another device" });
    }

    req.user = user;
    req.userType = "user";

    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};