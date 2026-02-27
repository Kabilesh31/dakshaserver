const mongoose = require("mongoose")

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Customer Name"],
    minLength: 3
  },
  phone: {
  type: String,
  required: true,
  trim: true
},

phone2: {
  type: String,
  trim: true
},
  address: {
    type: String,
    required: true
  },
  routeName: {
    type: String,
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route"
  },
  lineNo: {
    type: Number,
    default: 0,
  },
  creditDays: {
    type: Number
  },
  pincode: {
    type: Number,
  },
  geoLocation: {
    lat: {
      type: String
    },
    long: {
      type: String
    }
  },

   orderPending: {
    type: Boolean,
    default: false
  },
  waitingApprove : {
    type :Boolean,
    default : false
  },

  paymentPending: {
    type: Boolean,
    default: false
  },

  paymentPendingAmount: {
    type: Number,
    default: 0
  },
  gst: {
    type: String, 
    trim: true
  },

  lastOrderDate: {
    type: Date
  },
  isVisited: {
    type: Boolean,
    default: false
  },
  visitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff"
  },
  visitedAt: {
    type: Date
  },
  nextVisit: {
    nextVisitDate: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      default: null,
      trim: true
    },
    currentVisitLocation: {
        lat: {
          type: String,
          default: null
        },
        long: {
          type: String,
          default: null
        }
      }
  },


  isNew : {
    type : Boolean,
    default : true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  img: {
    type: String
  },
  category: {
    type: String 
  },
  lastOrderRejected : {
    type : Boolean,
    default : false
  }, 
  status: {
    type: Boolean,
    default: true
  },
})

module.exports = mongoose.model("Customer", customerSchema)
