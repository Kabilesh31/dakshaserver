const Customer = require("../model/customerModel");
const uploadToCloudinary = require("../utils/cloudinaryUpload");


// create Customer
exports.createCustomer = async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "customers");
      imageUrl = result.secure_url;
    }

    const customer = await Customer.create({
      ...req.body,
      geoLocation: {
        lat: req.body.lat,
        long: req.body.long,
      },
      img: imageUrl,
    });

    res.status(201).json({
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// get customer all
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ isDeleted: false })
      .sort({
        routeId: 1,   // group by route
        lineNo: 1     // 🔥 delivery order inside route
      });

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// get Customer by id
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update Customer
exports.updateCustomer = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "customers"
      );
      updateData.img = result.secure_url;
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Delete Customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer deleted successfully (soft delete)",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// customer Status Change
exports.changeCustomerStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer status updated",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getCustomers = async (req, res) => {
  const customers = await Customer.find({ isDeleted: false })
    .sort({ routeId: 1, lineNo: 1 });

  res.json(customers);
};
