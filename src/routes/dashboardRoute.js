const express = require("express")
const { getDashboard } = require("../controllers/dashboardCtrl")
const { protect } = require("../middleware/authZ")

const router = express.Router()

router.get("/", protect, getDashboard)

module.exports = router