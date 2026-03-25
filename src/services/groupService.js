// services/groupService.js
// All group and expense API calls go here.

import { getAuthHeaders } from './api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const groupService = {
  /**
   * Fetch all groups the current user belongs to.
   */
  getGroups: async () => {
    const res = await fetch(`${BASE_URL}/groups`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to load groups')
    return res.json()  // expected: Array<Group>
  },

  /**
   * Create a new group.
   * @param {string}   name
   * @param {string[]} memberNames — plain name strings (backend creates user records)
   */
  createGroup: async (name, memberNames) => {
    const res = await fetch(`${BASE_URL}/groups`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body:    JSON.stringify({ name, members: memberNames }),
    })
    if (!res.ok) throw new Error('Failed to create group')
    return res.json()  // expected: Group
  },

  /**
   * Add a new expense to a group.
   * @param {string} groupId
   * @param {object} expense — { description, amount, paidBy, splitBetween, splitType, createdAt }
   */
  addExpense: async (groupId, expense) => {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/expenses`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body:    JSON.stringify(expense),
    })
    if (!res.ok) throw new Error('Failed to add expense')
    return res.json()  // expected: Expense
  },
}
