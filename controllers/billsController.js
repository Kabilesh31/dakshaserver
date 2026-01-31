const Bill = require("../model/bills");
const Customer = require("../model/customerModel");

exports.createBill = async (req, res) => {
  try {
    let {
      customerName,
      customerId,
      orderedProducts,
      totalAmt,
      paidStatus,
      paymentMethod,
      orderStatus,
      createdBy,
    } = req.body;

    // Basic validation
    if (!customerName || !customerId || !orderedProducts || !totalAmt || !createdBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔥 BUSINESS RULE ENFORCEMENT
    // If paidStatus is false or null → paymentMethod must be null
    if (!paidStatus) {
      paidStatus = null;
      paymentMethod = null;
    }

    // If paidStatus is true → paymentMethod is required
    if (paidStatus === true) {
      const validMethods = ["cod", "online"];
      if (!paymentMethod || !validMethods.includes(paymentMethod)) {
        return res.status(400).json({
          message: "paymentMethod must be 'cod' or 'online' when paidStatus is true",
        });
      }
    }

    const newBill = await Bill.create({
      customerName,
      customerId,
      orderedProducts,
      totalAmt,
      paidStatus,
      paymentMethod,
      orderStatus,
      createdBy,
    });

    res.status(201).json({
      message: "Bill created successfully",
      bill: newBill,
    });
  } catch (error) {
    console.error("Create Bill error:", error);
    res.status(500).json({ message: error.message });
  }
};


// 2️⃣ Get all bills (optional filter by customerId)
exports.getBills = async (req, res) => {
  try {
    const { customerId } = req.query;

    const filter = customerId ? { customerId } : {};
    const bills = await Bill.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ bills });
  } catch (error) {
    console.error("Get Bills error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 3️⃣ Change order status
exports.changeOrderStatus = async (req, res) => {
  try {
    const { billId } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = ["pending", "approved", "out for delivery", "delivered"];
    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    bill.orderStatus = orderStatus;
    await bill.save();

    res.status(200).json({ message: "Order status updated", bill });
  } catch (error) {
    console.error("Change Order Status error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { billId } = req.params;
    const { paidStatus, paymentMethod } = req.body;

    // Validate
    if (paidStatus !== true) {
      return res.status(400).json({
        message: "This API is only for confirming payment (paidStatus = true)",
      });
    }

    const validMethods = ["cod", "online"];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: "paymentMethod must be 'cod' or 'online'",
      });
    }

    // 1️⃣ Find bill
    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // 2️⃣ Update bill
    bill.paidStatus = true;
    bill.paymentMethod = paymentMethod;
    await bill.save();

    // 3️⃣ Update customer paymentPending → false
    await Customer.findByIdAndUpdate(
      bill.customerId,
      { paymentPending: false },
      { new: true }
    );

    res.status(200).json({
      message: "Payment confirmed and customer payment cleared",
      bill,
    });
  } catch (error) {
    console.error("Update Payment Status error:", error);
    res.status(500).json({ message: error.message });
  }
};