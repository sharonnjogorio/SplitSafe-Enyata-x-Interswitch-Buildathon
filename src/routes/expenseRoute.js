const express = require("express")
const { 
  addExpense, 
  getGroupExpenses,
  deleteExpense
} = require("../controllers/expenseCtrl")
const { protect } = require("../middleware/authZ")

const router = express.Router()

router.post("/", protect, addExpense)
router.get("/group/:groupId", protect, getGroupExpenses)
router.delete("/:id", protect, deleteExpense)

module.exports = router