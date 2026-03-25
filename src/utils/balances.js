// utils/balances.js

/**
 * Returns a single user's net balance inside a group.
 * Positive = they are owed money.
 * Negative = they owe money.
 */
export function computeNetBalance(group, userId) {
  let net = 0

  group.expenses.forEach(({ amount, paidBy, splitBetween, splits, splitType }) => {
    if (paidBy === userId) net += amount

    if (splitBetween?.includes(userId)) {
      net -= splitType === 'equal'
        ? amount / splitBetween.length
        : (splits?.[userId] || 0)
    }
  })

  return net
}

/**
 * Returns net balance for every member of a group.
 * Useful for rendering the members list.
 */
export function computeMemberBalances(group) {
  return group.members.map((m) => ({
    ...m,
    net: computeNetBalance(group, m.id),
  }))
}
