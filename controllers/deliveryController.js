const Customer = require("../model/customerModel"); 

exports.updateLineOrder = async (req, res) => {
  try {
    const { routeId, customers } = req.body;

    if (!routeId || !Array.isArray(customers)) {
      return res.status(400).json({
        status: "error",
        error: "Invalid payload"
      });
    }

    const bulkOps = customers.map(c => ({
      updateOne: {
        filter: {
          _id: c._id,
          routeId: routeId
        },
        update: {
          $set: { lineNo: c.lineNo, isNew: false },
        }
      }
    }));

    const result = await Customer.bulkWrite(bulkOps);

    return res.json({
      status: "success",
      modifiedCount: result.modifiedCount
    });

  } catch (err) {
    console.error("UPDATE LINE ORDER ERROR 👉", err);
    return res.status(500).json({
      status: "error",
      error: err.message
    });
  }
};
