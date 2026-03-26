const express = require("express")
const {
  createGroup,
  getMyGroups,
  getGroup,
  addMember,
  leaveGroup
} = require("../controllers/groupCtrl")
const { protect } = require("../middleware/authZ")

const router = express.Router()

router.post("/", protect, createGroup)
router.get("/", protect, getMyGroups)
router.get("/:id", protect, getGroup)
router.post("/:id/members", protect, addMember)
router.delete("/:id/leave", protect, leaveGroup)

module.exports = router