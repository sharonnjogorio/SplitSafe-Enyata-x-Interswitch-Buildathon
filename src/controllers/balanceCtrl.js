const Expense = require("../models/expense")
const Group = require("../models/group")

exports.getGroupBalances = async (req, res) => {
  try {
    const { groupId } = req.params

    // Verify group exists and user is a member
    const group = await Group.findById(groupId)
      .populate("members", "name email")

    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    const isMember = group.members.some(
      member => member._id.toString() === req.user.id
    )
    if (!isMember) {
      return res.status(403).json({ message: "Forbidden" })
    }

    // Get ALL expenses for this group
    const expenses = await Expense.find({ group: groupId })

    // Build a balance map for every member
    // Start everyone at 0
    // { userId: netBalance }
    const balanceMap = {}

    group.members.forEach(member => {
      balanceMap[member._id.toString()] = 0
    })

    // Loop through every expense
    expenses.forEach(expense => {
      const paidById = expense.paidBy.toString()

      // Person who paid gets CREDITED the full amount
      // They fronted the money so they're owed it back
      if (balanceMap[paidById] !== undefined) {
        balanceMap[paidById] += expense.amount
      }

      // Each participant gets DEBITED their share
      // They consumed this much so they owe it
      expense.participants.forEach(participant => {
        const participantId = participant.user.toString()
        if (balanceMap[participantId] !== undefined) {
          balanceMap[participantId] -= participant.share
        }
      })
    })

    // Convert map into readable array with user details
    // positive = owed money (creditor)
    // negative = owes money (debtor)
    const balances = group.members.map(member => {
      const memberId = member._id.toString()
      const netBalance = Math.round(balanceMap[memberId] * 100) / 100

      return {
        user: {
          id: memberId,
          name: member.name,
          email: member.email
        },
        netBalance,
        status: netBalance > 0 
          ? "owed"      // someone owes them money
          : netBalance < 0 
            ? "owes"    // they owe someone money
            : "settled" // perfectly balanced
      }
    })

    // Calculate group total spent
    const totalSpent = expenses.reduce(
      (sum, expense) => sum + expense.amount, 0
    )

    // My personal balance
    const myBalance = balances.find(
      b => b.user.id === req.user.id
    )

    res.status(200).json({
      group: { id: group._id, name: group.name },
      totalSpent,
      myBalance,
      balances
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}