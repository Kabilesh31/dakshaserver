const Details = require("../model/detailsSchema")

exports.createDetails = async(req, res) => {
    
    try{
        const {name, address, phone, alterPhone, note, rating, createdBy} = req.body

        const newUser = new Details({
            name,
            address,
            phone,
            alterPhone,
            note,
            rating: Number(rating),
            createdBy,
            file: req.file ? req.file.buffer : null 
        })
        const savedUser = await newUser.save();
        res.status(201).json({ message: "User created successfully", user: savedUser });

    }catch(error){
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Failed to create user", error });
    }
}


exports.getAllDetails = async (req, res) => {
    try {
        const details = await Details.find();

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


exports.updateProductData = async(req, res, next) => {
    try {
      const { name, address, phone, alterPhone, note, rating } = req.body;
      const updateData = {};
      if (name) updateData.name = name;
      if (address) updateData.address = address ;
      if (phone) updateData.phone = phone;
      if (alterPhone) updateData.alterPhone = alterPhone;
      if (note) updateData.note = note;
      if (rating) updateData.rating = rating;
  
      if (req.file) {
        updateData.file = req.file.buffer;  
      }

      const updatedProduct = await Details.findByIdAndUpdate(req.params.id, updateData, { new: true });

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(200).json(updatedProduct);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }