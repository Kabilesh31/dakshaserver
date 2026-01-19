const Stock = require("../model/stocksModel") 
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")

exports.getStocksData = catchAsync(async(req, res, next) => {
    const data = await Stock.find()
        res.status(200).json({
            message:"Success",
            results: data.length,
            data:data, 
        })

})
exports.createStock = catchAsync(async (req, res, next) => {
    const { productName, productCode, stock, value, stockIn } = req.body;
    // Validate required fields
    if (!productName || !productCode || !value || !stock || !stockIn) {
        return res.status(400).json({
            message: "Failed to Create. All fields are required."
        });
    }

    // Check if the product code already exists
    const existingProductCode = await Stock.findOne({ productCode });
    if (existingProductCode) {
        return res.status(409).json({
            message: "This product code is already added."
        });
    }

    // Create the stock data
    const data = await Stock.create({
        productName,
        productCode,
        value,
        stock,
        stockIn
    });

    // Send success response
    return res.status(201).json({
        message: "Created Successfully",
        data: data
    });
});


exports.updateStocks = catchAsync(async(req, res, next) => {
    const data = await Stock.findByIdAndUpdate(req.params.id, req.body, {
        new:true
    })
    if(!data){
        return next(new AppError("This id Cant Find", 404))
    }
    res.status(200).json({
        status:"Success",
        data: data
    })
})


exports.deleteStockData = catchAsync(async (req, res, next) => {
  const data = await Stock.findByIdAndDelete(req.params.id);

  if (!data) {
    return next(new AppError("Stock not found with this ID", 404));
  }

  res.status(200).json({
    status: "Success",
    message: "Stock deleted successfully"
  });
});

exports.importStocks = async (req, res) => {
    const sheetData = req.body.data;

  if (!sheetData || sheetData.length === 0 ) {
    return res.status(400).send({ status: 0, message: 'No data or login user ID provided' });
  }

  const promises = sheetData.map(async row => {
    const [
      productName, productCode, price, stock, companyName
    ] = row;

    // Validation
    if (!productName || !productCode || !price || !stock || !companyName || companyName === 'SELECT COMPANY') {
      return { status: 0, message: 'Required fields are empty' };
    }

    try {
      // Check if the product already exists
      const existingProduct = await Stock.findOne({ productCode: productCode });
      if (existingProduct) {
        return { status: 0, message: `Product with code ${productCode} already exists` };
      }

      // Create a new product
      const newProduct = new Product({
        productName,
        productCode,
        price,
        stock,
        companyName,
      });

      await newProduct.save();
      return { status: 1, message: 'Product inserted successfully' };

    } catch (error) {
      return { status: 0, message: `Error: ${error.message}` };
    }
  });

  try {
    const results = await Promise.all(promises);
    res.status(200).send(results);
  } catch (error) {
    res.status(500).send({ status: 0, message: `Error: ${error.message}` });
  }
  };