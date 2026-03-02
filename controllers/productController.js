const Product = require("../model/productModel");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const XLSX = require("xlsx");
// create new product
exports.createProduct = async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "products"
      );
      imageUrl = result.secure_url;
    }

    const product = await Product.create({
      ...req.body,
      img: imageUrl,
    });

    res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// get all products

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get product by id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//update product
exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "products"
      );
      updateData.img = result.secure_url;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// softdelete
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.importProducts = async(req, res) => {
   try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read from buffer instead of file path
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];

    const sheetData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName],
      { defval: "" }
    );

    const products = sheetData.map((row) => {
      const normalizedRow = {};

      Object.keys(row).forEach((key) => {
        normalizedRow[key.toLowerCase().trim()] = row[key];
      });

      return {
        productName: normalizedRow["product name"]?.toString().trim(),
        productCode: normalizedRow["product code"]?.toString().trim(),
        brand: normalizedRow["brand"]?.toString().trim(),
        value: Number(normalizedRow["value"]) || 0,
        packing: normalizedRow["packing"] || "1 X 1",
        gst: Number(normalizedRow["gst"]) || 0,
        ptr1: Number(normalizedRow["ptr1"]) || 0,
        ptr2: Number(normalizedRow["ptr2"]) || 0,
        ptr3: Number(normalizedRow["ptr3"]) || 0,
        notes: normalizedRow["notes"] || "",
      };
    });

    // 🚀 Recommended: Upsert instead of insertMany
    for (const product of products) {
      await Product.updateOne(
        { productCode: product.productCode },
        { $set: product },
        { upsert: true }
      );
    }

    res.status(200).json({
      message: "Products imported successfully",
      count: products.length,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}