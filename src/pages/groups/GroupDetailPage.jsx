import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/index'
import { useApp } from '../../hooks/index'
import { computeNetBalance, computeMemberBalances } from '../../utils/balances'
import { formatNaira, formatDate } from '../../utils/formatters'
import { groupService } from '../../services/groupService'
import AppLayout from '../../layouts/AppLayout'
import styles from './GroupDetailPage.module.css'

/* ── Avatar helpers ── */
const AVATAR_COLORS = [
  '#1D4ED8', '#7C3AED', '#059669',
  '#D97706', '#DC2626', '#0891B2',
]
function getAvatarColor(name = '') {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}
function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

/* ── Expense category detection ── */
function getCategory(description = '') {
  const d = description.toLowerCase()
  if (/fuel|petrol|toll|transport|bus|uber|bolt|gate/.test(d)) return 'transport'
  if (/dinner|lunch|breakfast|food|restaurant|meal|eat|cass|seaside/.test(d)) return 'food'
  if (/airbnb|hotel|villa|apartment|accommodation|deposit|reservation/.test(d)) return 'accommodation'
  return 'other'
}

const CATEGORY_LABELS = {
  transport:     'Transport',
  food:          'Food & Dining',
  accommodation: 'Accommodation',
  other:         'Other',
}

const CATEGORY_COLORS = {
  transport:     '#1D4ED8',
  food:          '#645EFB',
  accommodation: '#EEC200',
  other:         '#9CA3AF',
}

function CategoryIcon({ category }) {
  const paths = {
    transport:     <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    food:          <path d="M3 11l19-9-9 19-2-8-8-2z"/>,
    accommodation: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
    other:         <rect x="3" y="3" width="18" height="18" rx="2"/>,
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={styles.expenseIconSvg}>
      {paths[category] || paths.other}
    </svg>
  )
}

export default function GroupDetailPage() {
  const { id }         = useParams()
  const { user }       = useAuth()
  const { getGroup, addExpense } = useApp()
  const navigate       = useNavigate()

  // Add Expense modal state
  const [showAddExp, setShowAddExp] = useState(false)
  const [expForm, setExpForm]       = useState({ description: '', amount: '' })

  // Add Member modal state
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberEmail,   setMemberEmail]   = useState('')
  const [memberLoading, setMemberLoading] = useState(false)
  const [memberError,   setMemberError]   = useState('')

  const group = getGroup(id)
  if (!group) {
    return (
      <AppLayout>
        <div className={styles.notFound}>
          <p>Group not found.</p>
          <Link to="/groups">← Back to Groups</Link>
        </div>
      </AppLayout>
    )
  }

  const myNet        = computeNetBalance(group, user.id)
  const memberBals   = computeMemberBalances(group)
  const totalExpense = group.expenses.reduce((s, e) => s + e.amount, 0)

  const catTotals = {}
  group.expenses.forEach((e) => {
    const cat = getCategory(e.description)
    catTotals[cat] = (catTotals[cat] || 0) + e.amount
  })
  const spendingBreakdown = Object.entries(catTotals)
    .map(([cat, total]) => ({ cat, total, pct: totalExpense > 0 ? Math.round((total / totalExpense) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct)

  const sorted = [...group.expenses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  function getMemberName(uid) {
    if (uid === user.id) return 'You'
    return group.members.find((m) => m.id === uid)?.name || uid
  }

  function myShare(exp) {
    if (!exp.splitBetween?.includes(user.id)) return null
    if (exp.splitType === 'equal') return exp.amount / exp.splitBetween.length
    return exp.splits?.[user.id] || 0
  }

  async function handleAddExpense() {
    const amt = parseFloat(expForm.amount)
    if (!expForm.description.trim() || isNaN(amt) || amt <= 0) return
    await addExpense(group.id, {
      description:  expForm.description.trim(),
      amount:       amt,
      paidBy:       user.id,
      splitBetween: group.members.map((m) => m.id),
      splitType:    'equal',
      createdAt:    new Date().toISOString(),
    })
    setExpForm({ description: '', amount: '' })
    setShowAddExp(false)
  }

  async function handleAddMember() {
    if (!memberEmail.trim()) return
    setMemberLoading(true)
    setMemberError('')
    try {
      await groupService.addMember(group.id, memberEmail.trim())
      setMemberEmail('')
      setShowAddMember(false)
      window.location.reload()
    } catch (err) {
      setMemberError(err.message || 'Failed to add member')
    } finally {
      setMemberLoading(false)
    }
  }

  async function handleDeleteExpense(expenseId) {
    if (!window.confirm('Delete this expense? This cannot be undone.')) return
    try {
      await groupService.deleteExpense(expenseId)
      window.location.reload()
    } catch (err) {
      alert(err.message || 'Failed to delete expense')
    }
  }

  const activeCount = group.members.length

  return (
    <AppLayout>
      {/* ── Breadcrumb ── */}
      <div className={styles.breadcrumb}>
        <Link to="/groups" className={styles.backLink}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Groups
        </Link>
      </div>

      <div className={styles.pageHeader}>
        <div>
          <p className={styles.groupTag}>Active Expedition</p>
          <h1 className={styles.groupName}>{group.name.toUpperCase()}</h1>
        </div>
        <div className={styles.netBalanceBox}>
          <p className={styles.netBalanceLabel}>Your Net Balance</p>
          <p className={`${styles.netBalanceAmount} ${myNet >= 0 ? styles.pos : styles.neg}`}>
            {myNet >= 0 ? '' : '-'}{formatNaira(Math.abs(myNet))}
          </p>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className={styles.layout}>

        {/* ── Left column ── */}
        <div className={styles.leftCol}>

          <div className={styles.clearCard}>
            <h2 className={styles.clearTitle}>
              {myNet < 0 ? 'Clear Outstanding' : 'Outstanding Balance'}
            </h2>
            <p className={styles.clearDesc}>
              {myNet < 0
                ? `Settle your debts with ${activeCount} members. Total required to reach zero balance: ${formatNaira(Math.abs(myNet))}.`
                : `You are owed by ${activeCount - 1} member${activeCount - 1 !== 1 ? 's' : ''}. Net amount owed to you: ${formatNaira(myNet)}.`
              }
            </p>
            <button className={styles.settleBtn} onClick={() => navigate('/settlements')}>
              Settle Now
            </button>
          </div>

          {/* Group Members card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Group Members</span>
              <span className={styles.activeBadge}>{activeCount} Active</span>
            </div>

            <div className={styles.memberList}>
              {memberBals.map((m) => {
                const displayName = m.id === user.id ? 'You' : m.name
                const initials    = getInitials(displayName)
                return (
                  <div key={m.id} className={styles.memberRow}>
                    <div className={styles.memberAvatar}
                      style={{ background: getAvatarColor(displayName) }}>
                      {initials}
                    </div>
                    <span className={styles.memberName}>
                      {displayName.split(' ')[0]}{' '}
                      {displayName.split(' ')[1]?.[0] ? displayName.split(' ')[1][0] + '.' : ''}
                    </span>
                    <span className={`${styles.memberBal} ${m.net >= 0 ? styles.pos : styles.neg}`}>
                      {m.net >= 0 ? '+' : '-'}{formatNaira(Math.abs(m.net))}
                    </span>
                  </div>
                )
              })}
            </div>

            <button
              className={styles.addMemberBtn}
              onClick={() => setShowAddMember(true)}
            >
              Add Member
            </button>
          </div>

          {/* Expense Split card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Expense Split</span>
            </div>
            {spendingBreakdown.length === 0 ? (
              <p className={styles.emptyMeta}>No expenses yet.</p>
            ) : (
              <div className={styles.splitList}>
                {spendingBreakdown.map(({ cat, pct }) => (
                  <div key={cat} className={styles.splitItem}>
                    <div className={styles.splitRow}>
                      <span className={styles.splitLabel}>{CATEGORY_LABELS[cat]}</span>
                      <span className={styles.splitPct}>{pct}%</span>
                    </div>
                    <div className={styles.splitBar}>
                      <div
                        className={styles.splitBarFill}
                        style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Right column ── */}
        <div className={styles.rightCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Recent Expenses</span>
              <div className={styles.expenseActions}>
                <button className={styles.iconBtn} title="Filter">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                  </svg>
                </button>
                <button className={styles.iconBtn} title="Search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </button>
                <button className={styles.addExpenseBtn} onClick={() => setShowAddExp(true)}>
                  + Add Expense
                </button>
              </div>
            </div>

            <div className={styles.expenseTableHead}>
              <span className={styles.colDesc}>Description &amp; Payee</span>
              <span className={styles.colDate}>Date</span>
              <span className={styles.colTotal}>Total Amount</span>
              <span className={styles.colShare}>Your Share</span>
              <span className={styles.colAction}></span>
            </div>

            <div className={styles.expenseList}>
              {sorted.length === 0 ? (
                <p className={styles.emptyMeta}>No expenses recorded yet.</p>
              ) : (
                sorted.map((exp) => {
                  const cat       = getCategory(exp.description)
                  const share     = myShare(exp)
                  const paidByMe  = exp.paidBy === user.id
                  const payerName = getMemberName(exp.paidBy)

                  return (
                    <div key={exp.id} className={styles.expenseRow}>
                      <div className={styles.expenseInfo}>
                        <div className={styles.expenseIcon}>
                          <CategoryIcon category={cat} />
                        </div>
                        <div className={styles.expenseText}>
                          <div className={styles.expenseDesc}>{exp.description}</div>
                          <div className={styles.expensePayer}>Paid by {payerName}</div>
                        </div>
                      </div>
                      <span className={styles.expenseDate}>{formatDate(exp.createdAt)}</span>
                      <span className={styles.expenseTotal}>{formatNaira(exp.amount)}</span>
                      <span className={`${styles.expenseShare} ${paidByMe ? styles.pos : styles.neg}`}>
                        {share === null
                          ? '—'
                          : paidByMe
                            ? `+${formatNaira(exp.amount - share)}`
                            : `-${formatNaira(share)}`
                        }
                      </span>

                      {/* Delete — only visible to the person who paid */}
                      <div className={styles.colAction}>
                        {paidByMe && (
                          <button
                            className={styles.deleteExpenseBtn}
                            onClick={() => handleDeleteExpense(exp.id)}
                            title="Delete expense"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              width="14" height="14">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14H6L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {sorted.length > 0 && (
              <div className={styles.archiveRow}>
                <button className={styles.archiveLink}>
                  View all {sorted.length} expenses — {new Date(sorted[sorted.length - 1].createdAt).getFullYear()} Archive
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Member modal ── */}
      {showAddMember && (
        <div className={styles.modalOverlay} onClick={() => setShowAddMember(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Member</h2>
              <button className={styles.modalClose} onClick={() => setShowAddMember(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className={styles.modalDesc}>
              Enter the email address of the person you want to add to {group.name}.
            </p>
            <input
              className={styles.modalInput}
              placeholder="Email address"
              type="email"
              value={memberEmail}
              onChange={e => setMemberEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddMember()}
            />
            {memberError && (
              <p className={styles.errorText}>{memberError}</p>
            )}
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setShowAddMember(false)}>
                Cancel
              </button>
              <button
                className={styles.modalConfirm}
                onClick={handleAddMember}
                disabled={memberLoading}
              >
                {memberLoading ? 'Adding…' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Expense modal ── */}
      {showAddExp && (
        <div className={styles.modalOverlay} onClick={() => setShowAddExp(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Expense</h2>
              <button className={styles.modalClose} onClick={() => setShowAddExp(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className={styles.modalDesc}>Split equally among all {activeCount} members.</p>
            <input
              className={styles.modalInput}
              placeholder="Description (e.g. Dinner at Mama Cass)"
              value={expForm.description}
              onChange={(e) => setExpForm((f) => ({ ...f, description: e.target.value }))}
            />
            <input
              className={styles.modalInput}
              placeholder="Amount in ₦ (e.g. 45000)"
              type="number"
              min="0"
              value={expForm.amount}
              onChange={(e) => setExpForm((f) => ({ ...f, amount: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleAddExpense()}
            />
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setShowAddExp(false)}>Cancel</button>
              <button className={styles.modalConfirm} onClick={handleAddExpense}>Add Expense</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
