// controllers/routeController.js
const Route = require("../model/routeModal");
const Customer = require("../model/customerModel");

// create route
exports.createRoute = async (req, res) => {
  try {
    const { routeName } = req.body;

    if (!routeName) {
      return res.status(400).json({
        message: "Route name is required",
      });
    }

    const route = await Route.create({
      routeName,
    });

    res.status(201).json({
      message: "Route created successfully",
      data: route,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// get all routes with customer count
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.aggregate([
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "routeId",
          as: "customers",
        },
      },
      {
        $project: {
          routeName: 1,
          isActive: 1,
          customerCount: { $size: "$customers" },
        },
      },
      {
        $sort: { routeName: 1 },
      },
    ]);

    res.json({
      success: true,
      data: routes,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// get single route by id
exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    res.json(route);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
