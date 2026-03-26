const express = require("express")
const {
  initiatePayment,
  verifyPayment,
  handleWebhook,
  getPaymentHistory
} = require("../controllers/paymentCtrl")
const { protect } = require("../middleware/authZ")

const router = express.Router()

router.post("/interswitch/webhook", handleWebhook)

router.post("/initiate", protect, initiatePayment)
router.get("/verify/:txnRef", protect, verifyPayment)
router.get("/history", protect, getPaymentHistory)

module.exports = router 