import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/index'
import { useApp } from '../hooks/index'
import { computeNetBalance } from '../utils/balances'
import { formatNaira, formatRelativeTime } from '../utils/formatters'
import { getDashboard } from '../services/dashboardService'
import GroupCard from '../components/dashboard/GroupCard'
import AppLayout from '../layouts/AppLayout'
import styles from './DashboardPage.module.css'

const CATEGORY_META = {
  food:          { label: 'Food & Dining',   color: '#645EFB' },
  transport:     { label: 'Transport',       color: '#1D4ED8' },
  accommodation: { label: 'Accommodation',   color: '#EEC200' },
  other:         { label: 'Other',           color: '#9CA3AF' },
}

function getCategory(description = '') {
  const d = description.toLowerCase()
  if (/fuel|petrol|toll|transport|bus|uber|bolt|gate/.test(d))               return 'transport'
  if (/dinner|lunch|breakfast|food|restaurant|meal|eat|cass|seaside/.test(d)) return 'food'
  if (/airbnb|hotel|villa|apartment|accommodation|deposit|reservation/.test(d)) return 'accommodation'
  return 'other'
}

function computeSpending(groups) {
  const totals = {}
  let grand = 0
  groups.forEach((g) =>
    (g.expenses || []).forEach((e) => {
      const cat = getCategory(e.description)
      totals[cat] = (totals[cat] || 0) + e.amount
      grand += e.amount
    })
  )
  if (grand === 0) return []
  return Object.entries(totals)
    .map(([cat, total]) => ({
      cat,
      label: CATEGORY_META[cat].label,
      color: CATEGORY_META[cat].color,
      pct:   Math.round((total / grand) * 100),
      total,
    }))
    .sort((a, b) => b.total - a.total)
}

// Activity icons by category
function ActivityIcon({ category }) {
  const icons = {
    food:          <path d="M3 11l19-9-9 19-2-8-8-2z"/>,
    transport:     <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    accommodation: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={styles.activityIconSvg}>
      {icons[category] || <rect x="3" y="3" width="18" height="18" rx="2"/>}
    </svg>
  )
}

export default function DashboardPage() {
  const { user }   = useAuth()
  const { groups } = useApp()
  const navigate   = useNavigate()

  const [summary, setSummary] = useState(null)

  useEffect(() => {
    getDashboard()
      .then(setSummary)
      .catch(() => {})
  }, [])

  const totalOwed = groups.reduce((s, g) => {
    const n = computeNetBalance(g, user.id)
    return s + (n > 0 ? n : 0)
  }, 0)

  const totalOwe = groups.reduce((s, g) => {
    const n = computeNetBalance(g, user.id)
    return s + (n < 0 ? Math.abs(n) : 0)
  }, 0)

  const recentActivity = groups
    .flatMap((g) => g.expenses.map((e) => ({ ...e, groupName: g.name })))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <AppLayout>
      <h1 className={styles.pageTitle}>Dashboard</h1>

      <div className={styles.layout}>

        {/* ── Left main column ── */}
        <div>

          {/* Balance hero card */}
          <div className={styles.balanceCard}>
            <p className={styles.balanceLabel}>Total Balance</p>
            <div className={styles.balanceAmount}>
              {formatNaira(totalOwed - totalOwe)}
              <span className={styles.balanceTrend}>
                <svg className={styles.balanceTrendIcon} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                  <polyline points="16 7 22 7 22 13"/>
                </svg>
              </span>
            </div>
            <div className={styles.balanceSubGrid}>
              <div className={styles.balanceSub}>
                <div className={styles.balanceSubTop}>
                  <span className={styles.balanceSubLabel}>You Are Owed</span>
                  <span className={styles.balanceSubArrow}>↑</span>
                </div>
                <div className={styles.balanceSubAmount}>{formatNaira(totalOwed)}</div>
              </div>
              <div className={styles.balanceSub}>
                <div className={styles.balanceSubTop}>
                  <span className={styles.balanceSubLabel}>You Owe</span>
                  <span className={styles.balanceSubArrow}>↓</span>
                </div>
                <div className={styles.balanceSubAmount}>{formatNaira(totalOwe)}</div>
              </div>
            </div>
          </div>

          {/* Active groups */}
          <div className={styles.sectionRow}>
            <span className={styles.sectionLabel}>Active Groups</span>
            <Link to="/groups" className={styles.viewAll}>View All ›</Link>
          </div>

          <div className={styles.groupsGrid}>
            {groups.slice(0, 4).map((group) => (
              <GroupCard key={group.id} group={group} userId={user.id} />
            ))}
          </div>

          {/* Recent activity */}
          <div className={styles.sectionRow}>
            <span className={styles.sectionLabel}>Recent Activity</span>
          </div>

          <div className={styles.activityList}>
            {recentActivity.map((exp) => {
              const paidByMe = exp.paidBy === user.id
              const myShare  = exp.splitBetween?.includes(user.id)
                ? exp.amount / exp.splitBetween.length : 0

              return (
                <div key={exp.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <ActivityIcon category={exp.category} />
                  </div>
                  <div className={styles.activityBody}>
                    <div className={styles.activityName}>{exp.description}</div>
                    <div className={styles.activityMeta}>
                      {exp.groupName} · {formatRelativeTime(exp.createdAt)}
                    </div>
                  </div>
                  <div className={styles.activityRight}>
                    {paidByMe ? (
                      <>
                        <div className={`${styles.activityAmt} ${styles.pos}`}>
                          +{formatNaira(exp.amount)}
                        </div>
                        <div className={styles.activitySubLabel}>Repaid to you</div>
                      </>
                    ) : (
                      <>
                        <div className={`${styles.activityAmt} ${styles.neg}`}>
                          -{formatNaira(myShare)}
                        </div>
                        <div className={styles.activitySubLabel}>
                          {myShare > 0 ? 'Your share' : 'Pending share'}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

        </div>

        {/* ── Right panel ── */}
        <div className={styles.rightPanel}>

          {/* Account summary — live from /dashboard */}
          <div className={styles.fundCard}>
            <div className={styles.fundCardTop}>
              <div className={styles.fundCardLeft}>
                <div className={styles.fundCardIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </div>
                <span className={styles.fundCardTitle}>Account Summary</span>
              </div>
            </div>

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryRowLabel}>Net Balance</span>
                <span className={`${styles.summaryRowValue} ${(summary?.netBalance ?? 0) >= 0 ? styles.pos : styles.neg}`}>
                  {formatNaira(Math.abs(summary?.netBalance ?? 0))}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryRowLabel}>Owed to you</span>
                <span className={`${styles.summaryRowValue} ${styles.pos}`}>
                  {formatNaira(summary?.totalOwedToYou ?? 0)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryRowLabel}>You owe</span>
                <span className={`${styles.summaryRowValue} ${styles.neg}`}>
                  {formatNaira(summary?.totalYouOwe ?? 0)}
                </span>
              </div>
            </div>

            <button className={styles.manageGoalBtn} onClick={() => navigate('/settlements')}>
              View Settlements
            </button>
          </div>

          {/* Smart settlement feature */}
          <div className={styles.smartCard}>
            <div className={styles.smartBadge}>
              <svg className={styles.smartBadgeIcon} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <circle cx="8" cy="18" r="3"/><circle cx="16" cy="6" r="3"/>
                <line x1="8" y1="15" x2="16" y2="9"/>
              </svg>
              Smart Settlements
            </div>
            <h3 className={styles.smartTitle}>Settle smarter.</h3>
            <p className={styles.smartDesc}>
              SplitSafe minimises the number of transfers needed to clear all debts across your groups.
            </p>
            <button className={styles.smartBtn} onClick={() => navigate('/settlements')}>
              View Settlements
            </button>
          </div>

          {/* Spending breakdown — computed from real expense data */}
          <div className={styles.spendingCard}>
            <p className={styles.spendingTitle}>Spending Breakdown</p>
            {computeSpending(groups).length === 0 ? (
              <p className={styles.spendingEmpty}>No expenses recorded yet.</p>
            ) : (
              computeSpending(groups).map((item) => (
                <div key={item.cat}>
                  <div className={styles.spendingRow}>
                    <span className={styles.spendingName}>{item.label}</span>
                    <span className={styles.spendingPct}>{item.pct}%</span>
                  </div>
                  <div className={styles.spendingBar}>
                    <div
                      className={styles.spendingBarFill}
                      style={{ width: `${item.pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
