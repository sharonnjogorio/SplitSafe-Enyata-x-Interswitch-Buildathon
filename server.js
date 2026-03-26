require("dotenv").config()        
const connectDB = require("./src/config/db")
const app = require("./app")

connectDB()                       

const PORT = process.env.PORT || 8000
app.listen(PORT, "0.0.0.0", () => {
  console.log(`SplitSafe API running on port ${PORT}`)
})