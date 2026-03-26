const mongoose = require("mongoose")

const expenseSchema = new mongoose.Schema({
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group",
    required: true 
  },
  description: { 
    type: String, 
    required: true
  },
  amount: { 
    type: Number, 
    required: true
  },
  paidBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  splitType: {
    type: String,
    enum: ["equal", "manual"],
    default: "equal"
  },
  category: {
    type: String,
    enum: ["transport", "food", "accommodation", "grocery", "utilities", "general"],
    default: "general"
  },
  participants: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    share: { 
      type: Number
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { 
  timestamps: true,
  versionKey: false
})

module.exports = mongoose.model("Expense", expenseSchema)