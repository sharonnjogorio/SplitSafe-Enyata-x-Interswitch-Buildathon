const Group = require("../models/group")
const Expense = require("../models/expense")
const Transaction = require("../models/transaction")
const settlementAlgorithm = require("../utils/settlementAlgo")

// GET OPTIMIZED SETTLEMENTS 
// Runs the algorithm and returns suggested transactions (Does not save to database yet, just shows the suggestion)
exports.getSettlement = async (req, res) => {
  try {
    const { groupId } = req.params

    // Verify group and membership
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

    // Get all expenses
    const expenses = await Expense.find({ group: groupId })

    // Build balance map 
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

    // Format balances for algorithm
    const balancesArray = group.members.map(member => ({
      userId: member._id.toString(),
      name: member.name,
      netBalance: Math.round(balanceMap[member._id.toString()] * 100) / 100
    }))

    // Check if already settled
    const allSettled = balancesArray.every(b => Math.abs(b.netBalance) < 0.01)
    if (allSettled) {
      return res.status(200).json({
        message: "Group is already fully settled! 🎉",
        transactions: [],
        totalTransactions: 0
      })
    }

    // Run the algorithm
    const optimizedTransactions = settlementAlgorithm(balancesArray)

    res.status(200).json({
      group: { id: group._id, name: group.name },
      message: `${optimizedTransactions.length} transaction(s) will settle all debts`,
      totalTransactions: optimizedTransactions.length,
      transactions: optimizedTransactions,

      algorithmNote: `Smart Settlement reduced payments to minimum ${optimizedTransactions.length} transaction(s)`
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

//CONFIRM SETTLEMENT
// Saves the suggested transactions to database and is called when user clicks "Confirm" before paying
exports.confirmSettlement = async (req, res) => {
  try {
    const { groupId, transactions } = req.body

    if (!groupId || !transactions || transactions.length === 0) {
      return res.status(400).json({ message: "groupId and transactions required" })
    }

    // Save each transaction to database with status "pending"
    const savedTransactions = await Transaction.insertMany(
      transactions.map(t => ({
        group: groupId,
        from: t.from.id,
        to: t.to.id,
        amount: t.amount,
        status: "pending"
      }))
    )

    res.status(201).json({
      message: "Settlement confirmed — proceed to payment",
      transactions: savedTransactions
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

//  REMIND DEBTOR - Mock endpoint 
exports.remindDebtor = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("from", "name email")
      .populate("to", "name email")

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    // In production would send email/push notification to transaction.from
    // For MVP: just acknowledge the reminder was "sent"
    res.status(200).json({
      message: `Reminder sent to ${transaction.from.name}`,
      reminderSent: true,
      recipient: transaction.from.name
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}