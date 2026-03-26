const settlementAlgorithm = (balances) => {

  const creditors = balances
    .filter(b => b.netBalance > 0)
    .map(b => ({ ...b }))

  const debtors = balances
    .filter(b => b.netBalance < 0)
    .map(b => ({ ...b }))

  if (creditors.length === 0 || debtors.length === 0) {
    return []
  }

  const transactions = []

  while (creditors.length > 0 && debtors.length > 0) {

    // Re-sort on every iteration 
    creditors.sort((a, b) => b.netBalance - a.netBalance)
    debtors.sort((a, b) => a.netBalance - b.netBalance)

    const creditor = creditors[0]
    const debtor = debtors[0]

    const transfer = Math.min(
      creditor.netBalance,
      Math.abs(debtor.netBalance)
    )

    const amount = Math.round(transfer * 100) / 100

    transactions.push({
      from: { id: debtor.userId, name: debtor.name },
      to: { id: creditor.userId, name: creditor.name },
      amount
    })

    creditor.netBalance -= amount
    debtor.netBalance += amount

    // Remove fully settled people from arrays
    if (Math.abs(creditor.netBalance) < 0.01) {
      creditors.shift()   // remove first element
    }
    if (Math.abs(debtor.netBalance) < 0.01) {
      debtors.shift()     // remove first element
    }
  }

  return transactions
}

module.exports = settlementAlgorithm