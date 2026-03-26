const Group = require("../models/group")
const Expense = require("../models/expense")
const Transaction = require("../models/transaction")

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id

    // Get all groups user belongs to
    const groups = await Group.find({
      members: userId,
      isActive: true
    }).populate("members", "name email")
     .sort({ updatedAt: -1 })

    // Calculate balances across ALL groups
    let totalOwedToYou = 0
    let totalYouOwe = 0

    // Loop through each group and calculate balance
    for (const group of groups) {
      const expenses = await Expense.find({ group: group._id })

      // Build balance map for this group
      const balanceMap = {}
      group.members.forEach(member => {
        balanceMap[member._id.toString()] = 0
      })

      expenses.forEach(expense => {
        const paidById = expense.paidBy.toString()
        if (balanceMap[paidById] !== undefined) {
          balanceMap[paidById] += expense.amount
        }
        expense.participants.forEach(participant => {
          const participantId = participant.user.toString()
          if (balanceMap[participantId] !== undefined) {
            balanceMap[participantId] -= participant.share
          }
        })
      })

      // Get this user's balance in this group
      const myGroupBalance = balanceMap[userId] || 0

      if (myGroupBalance > 0) {
        totalOwedToYou += myGroupBalance
      } else {
        totalYouOwe += Math.abs(myGroupBalance)
      }
    }

    // Net balance
    const netBalance = totalOwedToYou - totalYouOwe

    // Recent groups (last 5)
    const recentGroups = groups.slice(0, 5).map(group => ({
      id: group._id,
      name: group.name,
      type: group.type,
      memberCount: group.members.length,
      updatedAt: group.updatedAt
    }))

    // Recent transactions (last 5)
    const recentTransactions = await Transaction.find({
      $or: [
        { from: userId },
        { to: userId }
      ]
    })
      .populate("from", "name")
      .populate("to", "name")
      .populate("group", "name")
      .sort({ createdAt: -1 })
      .limit(5)

    res.status(200).json({
      netBalance: Math.round(netBalance * 100) / 100,
      totalOwedToYou: Math.round(totalOwedToYou * 100) / 100,
      totalYouOwe: Math.round(totalYouOwe * 100) / 100,
      recentGroups,
      recentTransactions
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}