
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

export function computeMemberBalances(group) {
  return group.members.map((m) => ({
    ...m,
    net: computeNetBalance(group, m.id),
  }))
}
