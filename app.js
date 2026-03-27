const express = require("express")
const cors = require("cors")
const rateLimit = require("express-rate-limit")

// Route imports
const authRoute = require("./src/routes/authRoute")
const dashboardRoute = require("./src/routes/dashboardRoute")
const groupRoute = require("./src/routes/groupRoute")
const expenseRoute = require("./src/routes/expenseRoute")
const balanceRoute = require("./src/routes/balanceRoute")
const settlementRoute = require("./src/routes/settlementRoute")
const paymentRoute = require("./src/routes/paymentRoute")

const app = express()

//Global Middleware 
app.use(cors({
  origin: process.env.FRONTEND_URL 
}))
app.use(express.json())            

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,        // 15 minutes
  max: 100,                         // 100 requests per window
  message: { message: "Too many requests, slow down" }
})

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,         // 5 minutes  
  max: 5,                           // 5 attempts only
  message: { message: "Too many login attempts, try again in 5 minutes" }
})

app.use(generalLimiter)             // applies to ALL routes

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    message: "SplitSafe API running 🚀" 
  })
})

// Routes 
app.use("/api/auth/login", loginLimiter)
app.use("/api/auth", authRoute)
app.use("/api/dashboard", dashboardRoute)
app.use("/api/groups", groupRoute)
app.use("/api/expenses", expenseRoute)
app.use("/api/balances", balanceRoute)
app.use("/api/settlement", settlementRoute)
app.use("/api/payments", paymentRoute)
app.use("/api/circles", circleRoute)

module.exports = app