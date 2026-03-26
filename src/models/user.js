const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true    // store emails consistently
  },
  phone: { 
    type: String, 
    unique: true,
    sparse: true       
  },
  password: { 
    type: String, 
    required: true, 
    select: false     
  },
  avatar: {
    type: String,
    default: null      // profile picture URL — optional
  }
}, { timestamps: true,
    versionKey:false
 })

// Pre-save hook — hash password automatically
userSchema.pre("save", async function() {
  if (!this.isModified("password")) return
  this.password = await bcrypt.hash(this.password, 10)
})

module.exports = mongoose.model("User", userSchema)