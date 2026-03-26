const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group",
    required: true 
  },
  from: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  to: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  amount: { 
    type: Number, 
    required: true 
  },
  status: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending"
  },
  interswitchReference: {
    type: String,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true,
  versionKey: false
})

module.exports = mongoose.model("Transaction", transactionSchema)