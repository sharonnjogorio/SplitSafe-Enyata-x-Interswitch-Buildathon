const mongoose = require("mongoose")

const groupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  type: {
    type: String,
    enum: ["trip", "rent", "ajo", "general"],
    default: "general"
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  versionKey: false
})

module.exports = mongoose.model("Group", groupSchema)