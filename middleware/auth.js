const jwt = require("jsonwebtoken");
const Staff = require("../model/staffModal");

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