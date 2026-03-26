const User = require("../models/user")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

//  REGISTER 
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    // Basic validation 
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Name, email and password are required" 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters" 
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" })
    }

    // Create user — password hashing handled by pre-save hook in model
    const user = await User.create({ 
      name, 
      email: email.toLowerCase(), 
      phone, 
      password 
    })

    res.status(201).json({ 
      message: "Account created successfully" 
      // Don't return token on register until after they login 
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

//  LOGIN 
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      })
    }

    // Find user — include password (hidden by default in model)
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    }).select("+password")

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
      // Don't say "email not found" as it poses a security risk
      // "invalid credentials" is a preferred error messsage for both wrong email AND wrong password
    }

    // Compare plain password with hashed password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },           // payload — just the ID
      process.env.JWT_SECRET,    
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    )

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

//  GET CURRENT USER 
exports.getMe = async (req, res) => {
  try {
    // req.user.id comes from JWT middleware — already verified
    const user = await User.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(user)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

//  UPDATE PROFILE 
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true }       // return updated document
    ).select("-password")

    res.status(200).json({ 
      message: "Profile updated", 
      user 
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}