const Activity = require("../model/activityModal");
const catchAsync = require("../utils/catchAsync");

exports.createActivityStatus = async (req, res) => {
  try {
    const { customerId, activityStatus } = req.body;

    const newUser = new Activity({
      customerId,
      activityStatus,
    });
    const savedUser = await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", user: savedUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create user", error });
  }
};

exports.getAllActivity = catchAsync(async (req, res) => {
  const user = await Activity.find();

  res.status(201).json({
    status: "Success",
    results: user.length,
    data: user,
  });
});
