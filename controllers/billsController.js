const Bill = require("../model/bills");
const Customer = require("../model/customerModel");
const Staff = require("../model/staffModal");
const mongoose = require("mongoose");
const Notification = require("../model/Notification");
const socket = require("../socket");




exports.createBill = async (req, res) => {
  try {
    let {
      customerName,
      customerId,
      orderedProducts,
      totalAmt,
      paidStatus = false,
      paymentMethod = null,
      orderStatus = "pending",
      createdBy,
       gst, 
    } = req.body;

    // VALIDATION
    if (
      !customerName ||
      !customerId ||
      !Array.isArray(orderedProducts) ||
      orderedProducts.length === 0 ||
      !totalAmt ||
      !createdBy
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // PAYMENT RULE
    if (!paidStatus) paymentMethod = null;
    if (paidStatus && !["cod", "online"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

// CREATE BILL
const bill = await Bill.create({
  customerName,
  customerId,
  orderedProducts,
  totalAmt,
  paidStatus,
  paymentMethod,
  orderStatus,
  createdBy,
});

// CREATE NOTIFICATION
const notification = await Notification.create({
  user: createdBy,
  title: "New Bill Created",
  message: `Bill #${bill._id.toString().slice(-6)} created for ${customerName}`,
  type: "bill",
  referenceId: bill._id,
  seen: false,
});

socket.sendNotification({
  ...notification.toObject(),
  timeAgo: "just now",
});

// ============================
// UPDATE CUSTOMER STATUS
// ============================
const customerUpdate = {
  orderPending: true,
  paymentPending: !paidStatus,
  lastOrderDate: new Date(),
};

// payment pending amount logic
if (paidStatus) {
  customerUpdate.paymentPendingAmount = 0;
} else {
  customerUpdate.$inc = { paymentPendingAmount: totalAmt };
}

// optional GST update
if (gst) {
  customerUpdate.gst = gst;
}

await Customer.findByIdAndUpdate(customerId, customerUpdate, {
  new: true,
});

    // FETCH CUSTOMER
    const customer = mongoose.Types.ObjectId.isValid(customerId)
      ? await Customer.findById(customerId).select("name phone address").lean()
      : null;

    // FETCH STAFF
    const staff = mongoose.Types.ObjectId.isValid(createdBy)
      ? await Staff.findById(createdBy).select("name mobile type").lean()
      : null;

    // FINAL RESPONSE
    res.status(201).json({
      message: "Bill created successfully",
      bill: {
        ...bill.toObject(),
      customerDetails: customer
  ? {
      name: customer.name || "",
      mobile: customer.phone || customer.mobile || "",
      address: customer.address || "",
    }
  : null,

        staffDetails: staff
          ? {
              name: staff.name,
              mobile: staff.mobile,
              type: staff.type,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Create Bill Error:", error);
    res.status(500).json({ message: "Failed to create bill" });
  }
};


exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 }).lean();

    const result = await Promise.all(
      bills.map(async (bill) => {
        const customer = mongoose.Types.ObjectId.isValid(bill.customerId)
          ? await Customer.findById(bill.customerId).lean()
          : null;

        const staff = mongoose.Types.ObjectId.isValid(bill.createdBy)
          ? await Staff.findById(bill.createdBy)
              .select("name mobile type")
              .lean()
          : null;

        return {
          ...bill,

          customerDetails: customer
            ? {
                name: customer.name || "",
                mobile: customer.phone || customer.mobile || "",
                address: customer.address || "",
              }
            : null,

          staffDetails: staff
            ? {
                name: staff.name || "",
                mobile: staff.mobile || "",
                type: staff.type || "",
              }
            : null,
        };
      })
    );

    res.status(200).json({
      message: "Bills fetched successfully",
      bills: result,
    });
  } catch (error) {
    console.error("Get Bills Error:", error);
    res.status(500).json({ message: "Failed to fetch bills" });
  }
};


exports.getBillById = async (req, res) => {
  try {
    const { billId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(billId)) {
      console.error("Invalid billId:", billId);
      return res.status(400).json({ message: "Invalid bill ID" });
    }

    const bill = await Bill.findById(billId).lean();
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    let customer = null;
    let staff = null;

    if (bill.customerId && mongoose.Types.ObjectId.isValid(bill.customerId)) {
      customer = await Customer.findById(bill.customerId)
        .select("name mobile address")
        .lean();
    }

    if (bill.createdBy && mongoose.Types.ObjectId.isValid(bill.createdBy)) {
      staff = await Staff.findById(bill.createdBy)
        .select("name mobile type")
        .lean();
    }

    res.status(200).json({
      message: "Bill fetched successfully",
      bill: {
        ...bill,
        customerDetails: customer
          ? { name: customer.name, mobile: customer.mobile || "-", address: customer.address || "-" }
          : { name: bill.customerName, mobile: "-", address: "-" },
        staffDetails: staff
          ? { name: staff.name, mobile: staff.mobile || "-", type: staff.type || "-" }
          : { name: "Unassigned", mobile: "-", type: "-" },
      },
    });
  } catch (error) {
    console.error("getBillById error:", error); // ✅ detailed logging
    res.status(500).json({ message: "Failed to fetch bill", error: error.message });
  }
};


exports.changeOrderStatus = async (req, res) => {
  try {
    const { billId } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = [
      "pending",
      "approved",
      "out for delivery",
      "delivered",
      "rejected",   // ✅ added
    ];

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


// exports.updatePaymentStatus = async (req, res) => {
//   try {
//     const { billId } = req.params;
//     const { paidStatus, paymentMethod } = req.body;

//     // Validate
//     if (paidStatus !== true) {
//       return res.status(400).json({
//         message: "This API is only for confirming payment (paidStatus = true)",
//       });
//     }

//     const validMethods = ["cod", "online"];
//     if (!paymentMethod || !validMethods.includes(paymentMethod)) {
//       return res.status(400).json({
//         message: "paymentMethod must be 'cod' or 'online'",
//       });
//     }

//     // 1️Find bill
//     const bill = await Bill.findById(billId);
//     if (!bill) {
//       return res.status(404).json({ message: "Bill not found" });
//     }

//     // Update bill
//     bill.paidStatus = true;
//     bill.paymentMethod = paymentMethod;
//     await bill.save();

//     // Update customer paymentPending → false
//     await Customer.findByIdAndUpdate(
//     bill.customerId,
//     {
//       paymentPending: false,
//       paymentPendingAmount: 0,
//     },
//     { new: true }
//   );


//     res.status(200).json({
//       message: "Payment confirmed and customer payment cleared",
//       bill,
//     });
//   } catch (error) {
//     console.error("Update Payment Status error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

exports.markHasDelivered = async(req, res) => {
  const {id} = req.params;
  try{
    const bill = await Bill.findOne({
      customerId : id,
      orderStatus : "approved"
    })

    if(!bill) {
      return res.status(404).json({
        success: false,
        message: "No pending bill found for this customer"
      })
    }

    bill.orderStatus = "delivered"
    bill.deliveredAt = new Date();

    await bill.save()
    
    // orderpending change
    
    await Customer.findByIdAndUpdate(
      id,
      {orderPending : false},
      {new : true}
    )

    res.status(200).json({
      success: true,
      message: "Order marked as delivered",
      data: bill
    })
  }catch(err){
    console.error(err); 
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}


exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {paymentMethod } = req.body;

    const bill = await Bill.findOne({
      customerId : id,
      paidStatus : false
    })

    if(!bill) {
      return res.status(404).json({
        success: false,
        message: "No pending bill found for this customer"
      })
    }

    bill.paidStatus = true;
    bill.paymentMethod = paymentMethod
    await bill.save()

    await Customer.findByIdAndUpdate(
      id, 
      { paymentPending : false, paymentPendingAmount : 0},
      { new : true}
    )

    res.status(200).json({
      success: true,
      message: "Payment Marked Successfull",
      data: bill
    })
  
  } catch (error) {
    console.error("Update Payment Status error:", error);
    res.status(500).json({ message: error.message });
  }
};

