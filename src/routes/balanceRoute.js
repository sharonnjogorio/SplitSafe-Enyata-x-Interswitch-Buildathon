const express = require("express")
const { getGroupBalances } = require("../controllers/balanceCtrl")
const { protect } = require("../middleware/authZ")

const router = express.Router()

router.get("/group/:groupId", protect, getGroupBalances)

module.exports = router
