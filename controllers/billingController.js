const Bill = require("../model/billingModal") 
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const Customer = require("../model/customerModel")
exports.generateBill = catchAsync(async (req, res, next) => {
  const {
      orderId,
      session,
      customerName,
      phone,
      productName,
      productCode,
      createdBy,
      totalAmount,
      value,
      quantity,
      createdAt,
      gst,
      gstPercentage
  } = req.body;

  if (!productName || !productCode || !totalAmount || !session) {
      return res.status(400).json({
          message: "Failed to Create. All fields are required."
      });
  }

  // Extract only the date part from createdAt
  const createdDate = new Date(createdAt).toISOString().split('T')[0];

  // Check for an existing record with the same date and session
  const existingBill = await Bill.findOne({
    session,
    phone,
    createdAt: { 
      $gte: new Date(`${createdDate}T00:00:00.000Z`), 
      $lt: new Date(`${createdDate}T23:59:59.999Z`) 
    }
  });

  if (existingBill) {
      // Iterate over the new products to process duplicates
      for (let index = 0; index < productName.length; index++) {
          const existingIndex = existingBill.productName.indexOf(productName[index]);

          if (existingIndex !== -1) {
              // Check if the product value is different
              if (existingBill.value[existingIndex] !== value[index]) {
                  return res.status(400).json({
                      message: "Entered product has a different value. Please delete the old bill."
                  });
              }
              existingBill.quantity[existingIndex] += quantity[index];
          } else {
              // If product does not exist, add new product data
              existingBill.productName.push(productName[index]);
              existingBill.productCode.push(productCode[index]);
              existingBill.value.push(value[index]);
              existingBill.quantity.push(quantity[index]);
          }
      }

      // Update the total amount
      existingBill.totalAmount += Number(totalAmount);

      await existingBill.save();

      return res.status(200).json({
          message: "Updated Successfully",
          data: existingBill
      });
  }

  // If no record exists, create a new one
  const newBill = await Bill.create({
      orderId,
      session,
      customerName,
      phone,
      productName,
      productCode,
      createdBy,
      totalAmount,
      value,
      quantity,
      createdAt,
      gst,
      gstPercentage
  });

  return res.status(201).json({
      message: "Created Successfully",
      data: newBill
  });
});

const moment = require('moment');

exports.getBillByPhone = async (req, res) => {
  try {
    const id = req.params.id;
    const type = req.query.type;

    let startDate, endDate;

    if (type === "weekly") {
      // Start: Monday of this week
      startDate = moment.utc().startOf('isoWeek'); // Monday
      // End: Sunday of this week
      endDate = moment.utc().endOf('isoWeek'); // Sunday
    } 
    else if (type === "monthly") {
      // Start: 1st of the current month
      startDate = moment.utc().startOf('month');
      // End: last day of the current month
      endDate = moment.utc().endOf('month');
    } 
    else if (type === "daily") {
      // Start: beginning of today
      startDate = moment.utc().startOf('day');
      // End: end of today
      endDate = moment.utc().endOf('day');
    } 
    else {
      return res.status(400).json({ message: "Invalid type. Only 'daily', 'weekly' or 'monthly' allowed." });
    }

    // Fetch bills within the range
    const bills = await Bill.find({
      phone: id,
      createdAt: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      },
    });

    res.status(200).json(bills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



// const moment = require('moment'); 

// exports.getBillByPhone = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const type = req.query.type;

//     let startDate, endDate;

//     if (type === "weekly") {
//       // Get today's date in UTC
//       const today = moment.utc();

//       // Find the nearest past Monday (start of the week) in UTC
//       startDate = today.clone().isoWeekday(1).startOf('day'); // 1 = Monday
//       endDate = today.clone().isoWeekday(7).endOf('day'); // 7 = Sunday

//     } else if (type === "monthly") {
//       // Get the current month and calculate range in UTC
//       const today = moment.utc();
//       startDate = today.clone().startOf('month'); // 1st of the current month
//       endDate = today; // Current date

//     } else if (type === "daily") {
//       // Get today's date range in UTC
//       const today = moment.utc();
//       startDate = today.clone().startOf('day'); // Start of today
//       endDate = today.clone().endOf('day');   // End of today

//     } else {
//       return res.status(400).json({ message: "Invalid type. Only 'daily', 'weekly' or 'monthly' allowed." });
//     }

//     // Fetch bills based on the date range using the createdAt field
//     const bills = await Bill.find({
//       phone: id,
//       createdAt: {
//         $gte: startDate.toDate(), // Convert to JavaScript Date object
//         $lte: endDate.toDate(),   // Convert to JavaScript Date object
//       },
//     });

//     // Return the data, even if it's empty
//     res.status(200).json(bills);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };



exports.updateInvoice = async(req, res, next) => {
  try {
    const {id} = req.params;
    const {invoiceNo} = req.body;
    const { fromDate } = req.body;
    const { toDate } = req.body;
    // Validate input
    if (!invoiceNo) {
      return res.status(400).json({ error: "Invoice number is required" });
    }
    if (!fromDate || !toDate) {
      return res.status(400).json({ error: "Date is required" });
    }
    // Find the document by _id and update invoiceNo
    const updatedBill = await Bill.findByIdAndUpdate(
      id,
      { invoiceNo, fromDate, toDate },
      { new: true } // Return the updated document
    );

    if (!updatedBill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.status(200).json({ message: "Invoice updated successfully", updatedBill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


exports.updateGenerated = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { invoiceNo } = req.body;

    const isGenerated = true;

    // Step 1: Update the Bill
    const updatedBill = await Bill.findByIdAndUpdate(
      id,
      { isGenerated, invoiceNo },
      { new: true }
    );

    if (!updatedBill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    // Step 2: Find and update the Customer by phone
    const phone = updatedBill.phone;

    if (phone) {
      const updatedCustomer = await Customer.findOneAndUpdate(
        { phone }, // Match customer by phone
        { paymentPending: true, 
          billUpdateAt : new Date() },
        { new: true }
      );

      if (!updatedCustomer) {
        console.warn(`No customer found with phone: ${phone}`);
      }
    } else {
      console.warn("No phone number found on updated bill.");
    }

    res.status(200).json({ message: "Invoice updated and paymentPending set for customer", updatedBill });

  } catch (error) {
    console.error("Error in updateGenerated:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// exports.updateGenerated = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { invoiceNo } = req.body; // Extract invoiceNo from request body

//     const isGenerated = true;  

//     // Find the document by _id and update fields
//     const updatedBill = await Bill.findByIdAndUpdate(
//       id,
//       { isGenerated, invoiceNo }, // Now invoiceNo is defined
//       { new: true } // Return the updated document
//     );

//     if (!updatedBill) {
//       return res.status(404).json({ error: "Bill not found" });
//     }

//     res.status(200).json({ message: "Invoice updated successfully", updatedBill });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };



exports.getAllBillByPhone = async (req, res) => {
  const id = req.params.id;

  // Validate phone number
  if (!/^\d{10}$/.test(id)) {
    return res.status(400).json({ message: "Invalid phone number format" });
  }

  try {
    const bills = await Bill.find({ phone: id, invoiceNo: { $gt: 0 } });

    // If no bills found, send an empty array
    res.status(200).json(bills);
  } catch (error) {
    console.error(`Error fetching bills for phone: ${id}`, error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getAllBill = async (req, res) => {
  try {
    const bills = await Bill.find();

    // If no bills found, send an empty array
    res.status(200).json(bills);
  } catch (error) {
    console.error(`Error fetching bills`, error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateHasPaid = async (req, res) => {
  try {
    const { id } = req.params; // Invoice number
    const { isPaid } = req.body; // The new isPaid value

    if (!id) {
      return res.status(400).json({ error: "Invoice number is required" });
    }

    if (typeof isPaid !== "boolean") {
      return res.status(400).json({ error: "isPaid must be a boolean value" });
    }

    // Step 1: Update all bills with the same invoiceNo
    const updatedBills = await Bill.updateMany(
      { invoiceNo: id },
      { isPaid },
      { new: true }
    );

    if (updatedBills.matchedCount === 0) {
      return res.status(404).json({ error: "No bills found with this invoice number" });
    }

    // Step 2: Find one bill (to get the phone of the customer)
    const bill = await Bill.findOne({ invoiceNo: id });

    if (bill && bill.phone) {
      await Customer.findOneAndUpdate(
        { phone: bill.phone },
        {
          paymentPending: false,   // if paid → false
          billUpdateAt: new Date(), // current timestamp
        },
        { new: true }
      );
    }

    res.status(200).json({
      message: "Payment status updated successfully for all bills and customer updated",
      updatedBills,
    });
  } catch (error) {
    console.error("Error in updateHasPaid:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// exports.updateHasPaid = async (req, res) => {
//   try {
//     const { id } = req.params; // Invoice number
//     const { isPaid } = req.body; // The new isPaid value

//     if (!id) {
//       return res.status(400).json({ error: "Invoice number is required" });
//     }

//     if (typeof isPaid !== "boolean") {
//       return res.status(400).json({ error: "isPaid must be a boolean value" });
//     }

//     // Update all bills with the same invoiceNo
//     const updatedBills = await Bill.updateMany(
//       { invoiceNo: id }, 
//       { isPaid }, 
//       { new: true }
//     );

//     if (updatedBills.matchedCount === 0) {
//       return res.status(404).json({ error: "No bills found with this invoice number" });
//     }

//     res.status(200).json({
//       message: "Payment status updated successfully for all bills with the same invoice number",
//       updatedBills,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


exports.updateQuantity = async(req, res) => {
  try{
    const id = req.params.id;
    const { quantity } = req.body; // Get updated quantity from request

    // Find and update order
    const updatedOrder = await Bill.findByIdAndUpdate(id , { quantity }, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order updated successfully", updatedOrder });
  }catch(err){

  }
}

exports.deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBill = await Bill.findByIdAndDelete(id);

    if (!deletedBill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.status(200).json({ message: "Bill deleted successfully", deletedBill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

exports.getUnpaidBills = async (req, res) => {
  try {
    const phone = req.params.id; // phone number from URL
    // Find bills where phone matches and isPaid is false
    const unpaidBills = await Bill.find({ phone, isPaid: false });

    if (!unpaidBills.length) {
      return res.status(404).json({
        status: "Fail",
        message: "No unpaid bills found for this phone number"
      });
    }

    res.status(200).json({
      status: "Success",
      results: unpaidBills.length,
      data: unpaidBills
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "Error",
      message: "Something went wrong"
    });
  }
};


exports.getTotalAmount = catchAsync( async(req, res, next) => {
    const bills = await Bill.find({}, "totalAmount isPaid createdAt");
  
      res.status(200).json({
          status: "Success",
          results: bills.length,
          data: bills
      })
})