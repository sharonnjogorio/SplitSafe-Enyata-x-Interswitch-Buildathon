require("dotenv").config()        
const connectDB = require("./src/config/db")
const app = require("./app")

connectDB()                       

const PORT = process.env.PORT || 8000
app.listen(PORT, "0.0.0.0", () => {
  console.log(`SplitSafe API running on port ${PORT}`)
})

// Keep Render alive — ping every 14 minutes
const https = require("https")
const RENDER_URL = "https://splitsafe-enyata-x-interswitch-buildathon.onrender.com"

// setInterval(() => {
//   https.get(RENDER_URL, (res) => {
//     console.log(`Keep-alive ping: ${res.statusCode}`)
//   }).on("error", (err) => {
//     console.log("Keep-alive error:", err.message)
//   })
// }, 14 * 60 * 1000) // every 14 minutes
