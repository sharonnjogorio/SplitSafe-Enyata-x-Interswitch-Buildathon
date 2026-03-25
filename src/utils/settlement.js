// ============================================================
// utils/settlement.js
// Smart Settlement Engine — the WOW factor algorithm
// ============================================================

/**
 * Computes the minimum number of transactions needed to
 * settle all debts within a group.
 *
 * @param {Array} expenses — array of expense objects from the group
 * @param {Array} members  — array of { id, name }
 * @returns {Array}        — [{ from, fromName, to, toName, amount }]
 */
export function computeSettlement(expenses, members) {
  // Step 1: compute net balance per user
  // positive = is owed money, negative = owes money
  const balance = {}
  members.forEach((m) => { balance[m.id] = 0 })

  expenses.forEach(({ amount, paidBy, splitBetween, splits, splitType }) => {
    const n = splitBetween.length
    balance[paidBy] += amount

    splitBetween.forEach((uid) => {
      balance[uid] -= splitType === 'equal'
        ? amount / n
        : (splits?.[uid] || 0)
    })
  })

  // Step 2: separate creditors and debtors
  const creditors = []
  const debtors   = []

  for (const [id, bal] of Object.entries(balance)) {
    const member = members.find((m) => m.id === id)
    if (bal >  0.01) creditors.push({ id, name: member.name, amount: bal })
    if (bal < -0.01) debtors.push({   id, name: member.name, amount: Math.abs(bal) })
  }

  // Step 3: sort largest first
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort(  (a, b) => b.amount - a.amount)

  // Step 4: greedy matching
  const transactions = []

  while (debtors.length > 0 && creditors.length > 0) {
    const debtor   = debtors[0]
    const creditor = creditors[0]
    const amount   = Math.min(debtor.amount, creditor.amount)

    transactions.push({
      from:     debtor.id,
      fromName: debtor.name,
      to:       creditor.id,
      toName:   creditor.name,
      amount:   Math.round(amount),
    })

    debtor.amount   -= amount
    creditor.amount -= amount

    if (debtor.amount   < 0.01) debtors.shift()
    if (creditor.amount < 0.01) creditors.shift()
  }

  return transactions
}
