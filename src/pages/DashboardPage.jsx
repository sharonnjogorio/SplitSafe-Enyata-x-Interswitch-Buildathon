import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/index'
import { useApp } from '../hooks/index'
import { computeNetBalance } from '../utils/balances'
import { formatNaira, formatRelativeTime } from '../utils/formatters'
import GroupCard from '../components/dashboard/GroupCard'
import AppLayout from '../layouts/AppLayout'
import styles from './DashboardPage.module.css'

// Spending breakdown bar colours (from design — blue, purple, amber)
const SPENDING_COLORS = ['#1D4ED8', '#645EFB', '#EEC200']

const SPENDING_DATA = [
  { label: 'Rent & Household', pct: 45 },
  { label: 'Entertainment',    pct: 28 },
  { label: 'Groceries',        pct: 15 },
]

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

          {/* Vacation fund */}
          <div className={styles.fundCard}>
            <div className={styles.fundCardTop}>
              <div className={styles.fundCardLeft}>
                <div className={styles.fundCardIcon}>🏖</div>
                <span className={styles.fundCardTitle}>Vacation Fund</span>
              </div>
              <span className={styles.fundCardPct}>65%</span>
            </div>
            <div className={styles.fundProgress}>
              <div className={styles.fundProgressFill} style={{ width: '65%' }} />
            </div>
            <p className={styles.fundMeta}>₦325,000.00 / ₦500,000.00 reached</p>
            <button className={styles.manageGoalBtn}>Manage Goal</button>
          </div>

          {/* AI Smart Feature */}
          <div className={styles.smartCard}>
            <div className={styles.smartBadge}>
              <svg className={styles.smartBadgeIcon} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              AI Smart Feature
            </div>
            <h3 className={styles.smartTitle}>Optimize your debts?</h3>
            <p className={styles.smartDesc}>
              Our algorithm found a way to reduce your active transactions through chain-settlements.
            </p>
            <button className={styles.smartBtn} onClick={() => navigate('/settlements')}>
              Apply Suggestions
            </button>
          </div>

          {/* Monthly spending */}
          <div className={styles.spendingCard}>
            <p className={styles.spendingTitle}>Monthly Spending</p>
            {SPENDING_DATA.map((item, i) => (
              <div key={item.label}>
                <div className={styles.spendingRow}>
                  <span className={styles.spendingName}>{item.label}</span>
                  <span className={styles.spendingPct}>{item.pct}%</span>
                </div>
                <div className={styles.spendingBar}>
                  <div
                    className={styles.spendingBarFill}
                    style={{ width: `${item.pct}%`, background: SPENDING_COLORS[i] }}
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
