const express = require("express")
const { 
  getSettlement,
  confirmSettlement,
  remindDebtor
} = require("../controllers/settlementCtrl")
const { protect } = require("../middleware/authZ")

const router = express.Router()

router.get("/group/:groupId", protect, getSettlement)
router.post("/confirm", protect, confirmSettlement)
router.post("/remind/:id", protect, remindDebtor)

module.exports = router
