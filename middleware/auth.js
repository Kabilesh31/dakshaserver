const jwt = require("jsonwebtoken");
const Staff = require("../model/staffModal");

exports.isStaffAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Find staff
    const staff = await Staff.findById(decoded.id).select("-password");

    if (!staff || staff.isDeleted) {
      return res.status(401).json({
        message: "Unauthorized access",
      });
    }

    if (staff.staffStatus !== "active") {
      return res.status(403).json({
        message: "Staff account is inactive",
      });
    }

    // 4️⃣ Attach staff to request
    req.staff = staff;
    req.staffId = staff._id;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
