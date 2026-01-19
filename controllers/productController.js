const Product = require("../model/productModel") 
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")

exports.getAllDetails = async (req, res) => {
  try {
      const details = await Product.find();

      const formattedDetails = details.map((detail) => {
          const fileData =
              detail.file
                  ? `data:image/jpeg;base64,${detail.file.toString('base64')}`  
                  : null;

          return {
              ...detail._doc, 
              file: fileData, 
          };
      });

      res.status(200).json(formattedDetails);
  } catch (error) {
      console.error("Error fetching details:", error);
      res.status(500).json({ message: "Failed to fetch details", error });
  }
};


exports.createProduct = async(req, res, next) => {
    
  try{
      const {productName, productCode,  value, description, createdBy, category} = req.body

      if (!productName || !productCode || !value ||  !description || !category) {
        return res.status(401).json({ message: "Failed to Create - Missing Fields" });
      }

    // Check if productCode already exists
      const existingProductCode = await Product.findOne({ productCode });
      if (existingProductCode) {
        return next(new AppError(401, "This ProductCode is Already Added"));
      }

      const newProduct = new Product({
          productName,
          category,
          productCode,
          value,
          description,
          createdBy,
          file: req.file ? req.file.buffer : null 
      })
      const savedProduct = await newProduct.save();
      res.status(201).json({ message: "User created successfully", user: savedProduct });

  }catch(error){
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user", error });
  }
}


// exports.createProduct = catchAsync(async(req, res, next) => {
//     const {productName, productCode, stock, value, description, row, coloumn, createdBy} = req.body

//     if(!productName || !productCode || !value || !stock || !description || !row || !coloumn){
//         res.status(401).json({
//             message:"Failed to Create",
//         })
//     }
//     const existingProductCode = await Product.findOne({productCode})
//     if(existingProductCode){
//       return next(new AppError(401, "This Productcode is Already Added"))
//     }

//     const data = await Product.create({
//         productName, productCode, value, stock, description, row, coloumn
//     })
    
//         res.status(201).json({
//             message:"Created Successfully",
//             data: data
//         })
    
// })

exports.updateProductData = async(req, res, next) => {
  try {
    const { productName, productCode,  value, description, category} = req.body;
    const updateData = {};
    if (productName) updateData.productName = productName;
    if (productCode) updateData.productCode = productCode;
    if (value) updateData.value = value;
    if (description) updateData.description = description;
    if  (category) updateData.category = category;
    if (req.file) {
      updateData.file = req.file.buffer;  
    }


    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

  
    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// exports.updateProductData = catchAsync(async(req, res, next) => {
//     const data = await Product.findByIdAndUpdate(req.params.id, req.body, {
//         new:true
//     })
//     if(!data){
//         return next(new AppError("This id Cant Find", 404))
//     }
//     res.status(200).json({
//         status:"Success",
//         data: data
//     })
// })

exports.DeleteProductData = catchAsync(async (req, res, next) => {
  const data = await Product.findByIdAndDelete(req.params.id);

  if (!data) {
    return next(new AppError("Product not found with this ID", 404));
  }

  res.status(200).json({
    status: "Success",
    message: "Product deleted successfully"
  });
});


exports.importProducts = async (req, res) => {
    const sheetData = req.body.data;
  if (!sheetData || sheetData.length === 0 ) {
    return res.status(400).send({ status: 0, message: 'No data or login user ID provided' });
  }
  const promises = sheetData.map(async newRow => {
    const [
      productName, productCode, value, stock, description, row, coloumn
    ] = newRow;

    // Validation
    if (!productName || !productCode || !value || !stock || !description || !row || !coloumn) {
      return { status: 0, message: 'Required fields are empty' };
    }

    try {
      // Check if the product already exists
      const existingProduct = await Product.findOne({ productCode: productCode });
      if (existingProduct) {
        return { status: 0, message: `Product with code ${productCode} already exists` };
      }

      // Create a new product
      const newProduct = new Product({
        productName,
        productCode,
        value,
        stock,
        description,
        row,
        coloumn,
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

exports.reduceStocks = async(req, res, next) => {
    const { id } = req.params; // Product ID from the URL
    const { stock } = req.body; // Updated stock from the request body

    try {
      // Find the product by ID
      const product = await Product.findById(id);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Update stock in the database
      product.stock = stock;
      await product.save();
  
      res.status(200).json({ message: 'Product stock updated successfully', product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating product stock', error: error.message });
    }
}