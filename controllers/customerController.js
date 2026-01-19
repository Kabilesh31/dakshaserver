const Customer = require("../model/customerModel");
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")

exports.getAllDetails = catchAsync( async (req, res) => {
    const user = await Customer.find();

    res.status(201).json({
        status: "Success",
        results: user.length,
        data: user
    })
    })

exports.createCustomer = async(req, res, next) => {
        try{
            const {name, email, phone, phone2, location, type, address, district, state, pincode, createdBy, staff, gst} = req.body

      
            if(!name || !email || !phone ||!type){
                return res.status(401).json({ message: "Failed to Create - Missing Fields" });
            }
            const newCustomer = new Customer({
                name,
                email,
                phone,
                phone2,
                location,
                address,
                district,
                staff,
                state,
                type,
                pincode,
                createdBy, 
                gst
            })  
            const savedCustomer = await newCustomer.save();
            res.status(201).json({ message: "Customer created successfully", user: savedCustomer });
        }
        catch(error){
            console.error("Error creating user:", error);
            res.status(500).json({ message: "Failed to create user", error });
        } 
    }
    

exports.updateCustomer = catchAsync( async(req, res, next) => {
        const id = req.params.id
        const data = await Customer.findByIdAndUpdate(id, req.body,{
            new: true
        })
        if(!data){
            return next(new AppError("This id Cant Find", 404))
        }
        res.status(200).json({
            status:"Success",
            data: data
        })
    })

exports.updateDelete = catchAsync( async(req, res, next) => {
    const id = req.params.id
    const data = await Customer.findByIdAndUpdate(id, req.body,{
        new: true
    })
    if(!data){
        return next(new AppError("This id Cant Find", 404))
    }
    res.status(200).json({
        status:"Success",
        data: data
    })
})

exports.updateStatus = catchAsync( async(req, res, next) => {
    const id = req.params.id

    // if DeactivatedAt is null then update it with current date
    if(req.body.status === false){
        req.body.deactivatedAt = Date.now();
    }

    const data = await Customer.findByIdAndUpdate(id, req.body,{
        new: true,
        runValidators: true,
    })
    if(!data){
        return next(new AppError("This id Cant Find", 404))
    }
    res.status(200).json({
        status:"Success",
        data: data
    })
})

exports.getTransactions = catchAsync(async (req, res) => {
    // Find only documents that have billUpdateAt defined and not null
    const transactions = await Customer.find({ billUpdateAt: { $exists: true, $ne: null } })
        .sort({ billUpdateAt: -1 }); // Latest first

    res.status(200).json({
        status: "Success",
        results: transactions.length,
        data: transactions
    });
});