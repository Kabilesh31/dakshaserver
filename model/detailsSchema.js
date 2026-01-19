const mongoose = require("mongoose")


const detailSchema = new mongoose.Schema({
    name: {
        type:String,
        required:[true,"Please Enter Your Name"],
        minLength: 5
    },
    address : {
        type:String
    },
    phone : {
        type:String,
        required:[true,"Please Enter Your Name"],
    },
    alterPhone: String,
    note: String,
    rating: Number,
    createdBy: String,
    file: Buffer
})
module.exports = mongoose.model("Detail", detailSchema)