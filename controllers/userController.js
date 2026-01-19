const User = require("../model/userModel")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")



exports.createUser = async (req, res) => {
    res.status(500).json({
        status:"Error",
        message:"This Route is not yet Defined"
    })
}

exports.getAllUser = catchAsync( async (req, res) => {
    const user = await User.find();

    res.status(201).json({
        status: "Success",
        results: user.length,
        data: user
    })
    })

exports.getUser = catchAsync (async (req, res, next) => {
    
        const data = await User.findById(req.params.id)
        res.status(200).json(data)
    
    })
    
exports.updateUser = catchAsync( async(req, res, next) => {
    const id = req.params.id
    const data = await User.findByIdAndUpdate(id, req.body,{
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
    