const Expense = require("../models/expense")
const Group = require("../models/group")

//  ADD EXPENSE 
exports.addExpense = async (req, res) => {
  try {
    const { 
      groupId, 
      description, 
      amount, 
      paidBy,          // userId of who paid
      participants,    // array of userIds who were involved in the expense
      category 
    } = req.body

    //  Validation 
    if (!groupId || !description || !amount || !paidBy || !participants) {
      return res.status(400).json({ 
        message: "groupId, description, amount, paidBy and participants are required" 
      })
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ 
        message: "Participants must be a non-empty array of user IDs" 
      })
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        message: "Amount must be greater than zero" 
      })
    }

    //  Group Check 
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // Must be a group member to add expense
    const isMember = group.members.some(
      memberId => memberId.toString() === req.user.id
    )
    if (!isMember) {
      return res.status(403).json({ 
        message: "You must be a group member to add expenses" 
      })
    }

    //  Validate all participants are group members 
    // Prevents adding expenses for people not in the group
    const groupMemberIds = group.members.map(id => id.toString())

    const invalidParticipants = participants.filter(
      userId => !groupMemberIds.includes(userId)
    )

    if (invalidParticipants.length > 0) {
      return res.status(400).json({ 
        message: "All participants must be members of this group" 
      })
    }

    //  Validate paidBy is a group member 
    if (!groupMemberIds.includes(paidBy)) {
      return res.status(400).json({ 
        message: "paidBy must be a member of this group" 
      })
    }

    //  Calculate Equal Split - core logic
    // Divide total amount by number of participants
    // Round to 2 decimal places to avoid floating point issues
    // e.g. ₦60,000 ÷ 3 = ₦20,000.00 each

    const sharePerPerson = Math.round((amount / participants.length) * 100) / 100

    // Build participants array with each person's share
    const participantsWithShares = participants.map(userId => ({
      user: userId,
      share: sharePerPerson
    }))

    //  Create Expense 
    const expense = await Expense.create({
      group: groupId,
      description,
      amount,
      paidBy,
      splitType: "equal",
      category: category || "general",
      participants: participantsWithShares,
      createdBy: req.user.id    // who added it to the app
    })

    // Populate for clean response
    const populated = await Expense.findById(expense._id)
      .populate("paidBy", "name email")
      .populate("createdBy", "name email")
      .populate("participants.user", "name email")
      .populate("group", "name")

    res.status(201).json({
      message: "Expense added successfully",
      expense: populated,
      splitSummary: {
        totalAmount: amount,
        numberOfParticipants: participants.length,
        sharePerPerson: sharePerPerson,
        splitMethod: "Equally among " + participants.length + " people"
      }
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

//  GET GROUP EXPENSES 
exports.getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params

    // Verify group exists and user is a member
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    const isMember = group.members.some(
      memberId => memberId.toString() === req.user.id
    )
    if (!isMember) {
      return res.status(403).json({ message: "Forbidden" })
    }

    // Get all expenses for this group, newest first
    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", "name email")
      .populate("createdBy", "name email")
      .populate("participants.user", "name email")
      .sort({ createdAt: -1 })

    // Calculate my share in each expense
    const expensesWithMyShare = expenses.map(expense => {
      const myParticipation = expense.participants.find(
        p => p.user._id.toString() === req.user.id
      )
      return {
        ...expense.toObject(),
        myShare: myParticipation ? myParticipation.share : 0
        // 0 means you weren't part of this expense
      }
    })

    res.status(200).json({
      count: expenses.length,
      expenses: expensesWithMyShare
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

//  DELETE EXPENSE 
// Only the person who created it OR group admin can delete
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" })
    }

    // Get group to check if user is admin
    const group = await Group.findById(expense.group)

    const isCreator = expense.createdBy.toString() === req.user.id
    const isAdmin = group.createdBy.toString() === req.user.id

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ 
        message: "Only the expense creator or group admin can delete this" 
      })
    }

    await Expense.findByIdAndDelete(req.params.id)

    res.status(200).json({ message: "Expense deleted successfully" })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}