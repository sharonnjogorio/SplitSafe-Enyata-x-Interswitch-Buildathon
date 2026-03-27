import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/index'
import { useApp }  from '../hooks/index'
import { computeSettlement } from '../utils/settlement'
import { computeNetBalance }  from '../utils/balances'
import { formatNaira }        from '../utils/formatters'
import { settlementService }  from '../services/settlementService'
import { paymentService }     from '../services/paymentService'
import AppLayout from '../layouts/AppLayout'
import styles    from './SettlementsPage.module.css'

/* ── Avatar helpers ── */
const AVATAR_COLORS = ['#1D4ED8','#7C3AED','#059669','#D97706','#DC2626','#0891B2']
function getAvatarColor(name = '') { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] }
function getInitials(name = '')    { return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() }

/* ── Pay Now modal ── */
function PayNowModal({ tx, group, groupTransactions, onClose, onPaid }) {
  const { user }            = useAuth()
  const [paying, setPaying] = useState(false)
  const [done,   setDone]   = useState(false)
  const [error,  setError]  = useState('')

  async function handlePay() {
    setPaying(true)
    setError('')

    try {
      // 1 — Persist the full settlement plan for this group to get DB _ids
      const confirmed = await settlementService.confirmSettlement(
        group.id,
        groupTransactions.map(t => ({
          from:   { id: t.from },
          to:     { id: t.to },
          amount: t.amount,
        }))
      )

      // 2 — Find the specific transaction this user is paying
      const confirmedTx = confirmed.transactions.find(
        ct => String(ct.from) === String(tx.from) && String(ct.to) === String(tx.to)
      )
      if (!confirmedTx) throw new Error('Transaction not found after confirmation')

      // 3 — Initiate payment → get Interswitch checkoutParams
      const { checkoutParams } = await paymentService.initPayment({
        transactionId: confirmedTx._id,
      })

      // 4 — Launch Interswitch inline checkout popup
      if (typeof window.webpayCheckout !== 'function') {
        throw new Error('Interswitch checkout SDK not loaded. Please refresh and try again.')
      }

      window.webpayCheckout({
        ...checkoutParams,
        onComplete: async (response) => {
          // 5 — Verify payment with backend
          try {
            await paymentService.verifyPayment(checkoutParams.txn_ref)
          } catch { /* verification may still be async — mark done */ }
          setPaying(false)
          setDone(true)
        },
        onClose: () => {
          setPaying(false)
        },
      })
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.')
      setPaying(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {done ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className={styles.successTitle}>Payment Sent!</h2>
            <p className={styles.successDesc}>
              {formatNaira(tx.amount)} sent to <strong>{tx.toName}</strong> via Interswitch.
            </p>
            <button className={styles.modalConfirm} onClick={() => { onPaid(); onClose() }}>Done</button>
          </div>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <div className={styles.interswitchBadge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
                Interswitch Pay
              </div>
              <button className={styles.modalClose} onClick={onClose}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className={styles.paymentCard}>
              <p className={styles.paymentLabel}>You are paying</p>
              <p className={styles.paymentAmount}>{formatNaira(tx.amount)}</p>
              <p className={styles.paymentSub}>to <strong>{tx.toName}</strong> · {group.name}</p>
            </div>

            <div className={styles.paymentMeta}>
              <div className={styles.paymentMetaRow}><span>Recipient</span><span>{tx.toName}</span></div>
              <div className={styles.paymentMetaRow}><span>Group</span><span>{group.name}</span></div>
              <div className={styles.paymentMetaRow}><span>Amount</span><span>{formatNaira(tx.amount)}</span></div>
              <div className={styles.paymentMetaRow}><span>Fee</span><span>₦0.00</span></div>
            </div>

            {error && <p className={styles.payError}>{error}</p>}

            <button
              className={styles.modalConfirm}
              onClick={handlePay}
              disabled={paying}
            >
              {paying ? 'Opening Interswitch…' : `Pay ${formatNaira(tx.amount)}`}
            </button>
            <button className={styles.modalCancel} onClick={onClose}>Cancel</button>
          </>
        )}
      </div>
    </div>
  )
}

export default function SettlementsPage() {
  const { user }    = useAuth()
  const { groups, markPaid } = useApp()



console.log('groups debug:', JSON.stringify(groups.map(g => ({
  name: g.name,
  members: g.members.map(m => ({ id: m.id, name: m.name })),
  expenses: g.expenses.map(e => ({ 
    paidBy: e.paidBy, 
    splitBetween: e.splitBetween 
  }))
})), null, 2))

  const navigate    = useNavigate()
  const [payModal, setPayModal] = useState(null) // { tx, group, transactions }
  const [reminding, setReminding] = useState(null)

  const groupSettlements = groups
    .map(g => ({
      group:        g,
      transactions: computeSettlement(g.expenses, g.members),
    }))
    .filter(({ transactions }) => transactions.length > 0)

  const totalIOwe = groupSettlements.reduce((s, { transactions }) =>
    s + transactions.filter(t => t.from === user.id).reduce((a, t) => a + t.amount, 0), 0)

  const totalOwedToMe = groupSettlements.reduce((s, { transactions }) =>
    s + transactions.filter(t => t.to === user.id).reduce((a, t) => a + t.amount, 0), 0)

  const totalTx = groupSettlements.reduce((s, { transactions }) => s + transactions.length, 0)

  const rawDebts = groups.reduce((s, g) =>
    s + g.expenses.reduce((a, e) => a + (e.splitBetween?.length || 0), 0), 0)

  function handleMarkPaid(groupId, tx) { markPaid(groupId, tx.from, tx.to, tx.amount) }

  async function handleRemind(transactionId) {
    setReminding(transactionId)
    try { await settlementService.remindDebtor(transactionId) } catch { /* silent */ }
    finally { setReminding(null) }
  }

  return (
    <AppLayout>
      <h1 className={styles.pageTitle}>Settlements</h1>

      {/* Smart Settlement banner */}
      <div className={styles.aiBanner}>
        <div className={styles.aiBannerLeft}>
          <div className={styles.aiBadge}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              width="13" height="13">
              <circle cx="8" cy="18" r="3"/><circle cx="16" cy="6" r="3"/>
              <line x1="8" y1="15" x2="16" y2="9"/>
            </svg>
            Smart Settlement
          </div>
          <h2 className={styles.aiBannerTitle}>Minimum transactions, zero confusion.</h2>
          <p className={styles.aiBannerDesc}>
            SplitSafe reduced <strong>{rawDebts} potential transfers</strong> down to just{' '}
            <strong>{totalTx} optimised transaction{totalTx !== 1 ? 's' : ''}</strong> across all your groups.
          </p>
        </div>
        <div className={styles.aiBannerRight}>
          <div className={styles.aiStat}>
            <span className={styles.aiStatNum}>{rawDebts}</span>
            <span className={styles.aiStatLabel}>Raw debts</span>
          </div>
          <div className={styles.aiArrow}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
          <div className={styles.aiStat}>
            <span className={`${styles.aiStatNum} ${styles.highlight}`}>{totalTx}</span>
            <span className={styles.aiStatLabel}>Optimised</span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>You Owe (Total)</p>
          <p className={`${styles.summaryAmount} ${styles.neg}`}>{formatNaira(totalIOwe)}</p>
          <p className={styles.summaryMeta}>across {groupSettlements.filter(({ transactions: t }) => t.some(x => x.from === user.id)).length} group(s)</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Owed to You</p>
          <p className={`${styles.summaryAmount} ${styles.pos}`}>{formatNaira(totalOwedToMe)}</p>
          <p className={styles.summaryMeta}>across {groupSettlements.filter(({ transactions: t }) => t.some(x => x.to === user.id)).length} group(s)</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Net Balance</p>
          <p className={`${styles.summaryAmount} ${totalOwedToMe - totalIOwe >= 0 ? styles.pos : styles.neg}`}>
            {totalOwedToMe - totalIOwe >= 0 ? '' : '-'}{formatNaira(Math.abs(totalOwedToMe - totalIOwe))}
          </p>
          <p className={styles.summaryMeta}>{totalTx} transaction{totalTx !== 1 ? 's' : ''} remaining</p>
        </div>
      </div>

      {/* Per-group settlement sections */}
      {groupSettlements.length === 0 ? (
        <div className={styles.allSettled}>
          <div className={styles.allSettledIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className={styles.allSettledTitle}>All settled up!</p>
          <p className={styles.allSettledDesc}>No outstanding balances across any of your groups.</p>
        </div>
      ) : (
        groupSettlements.map(({ group, transactions }) => (
          <div key={group.id} className={styles.groupSection}>
            <div className={styles.groupSectionHeader}>
              <div className={styles.groupSectionLeft}>
                <span className={styles.groupSectionName}>{group.name}</span>
                <span className={styles.groupSectionCount}>
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button className={styles.viewGroupBtn} onClick={() => navigate(`/groups/${group.id}`)}>
                View Group →
              </button>
            </div>

            <div className={styles.txList}>
              {transactions.map((tx, i) => {
                const isMePaying    = tx.from === user.id
                const isMeReceiving = tx.to   === user.id
                const isMyTx = isMePaying || isMeReceiving

                return (
                  <div key={i} className={`${styles.txRow} ${isMyTx ? styles.txRowHighlight : ''}`}>
                    {/* From */}
                    <div className={styles.txPerson}>
                      <div className={styles.txAvatar} style={{ background: getAvatarColor(tx.fromName) }}>
                        {getInitials(tx.fromName)}
                      </div>
                      <div className={styles.txPersonInfo}>
                        <span className={styles.txPersonName}>{tx.from === user.id ? 'You' : tx.fromName}</span>
                        <span className={styles.txPersonRole}>pays</span>
                      </div>
                    </div>

                    {/* Arrow + amount */}
                    <div className={styles.txMiddle}>
                      <div className={styles.txAmountPill}>{formatNaira(tx.amount)}</div>
                      <div className={styles.txArrow}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                          <polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </div>
                    </div>

                    {/* To */}
                    <div className={styles.txPerson}>
                      <div className={styles.txAvatar} style={{ background: getAvatarColor(tx.toName) }}>
                        {getInitials(tx.toName)}
                      </div>
                      <div className={styles.txPersonInfo}>
                        <span className={styles.txPersonName}>{tx.to === user.id ? 'You' : tx.toName}</span>
                        <span className={styles.txPersonRole}>receives</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.txActions}>
                      {isMePaying && (
                        <button
                          className={styles.payNowBtn}
                          onClick={() => setPayModal({ tx, group, transactions })}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                            <rect x="2" y="5" width="20" height="14" rx="2"/>
                            <line x1="2" y1="10" x2="22" y2="10"/>
                          </svg>
                          Pay Now
                        </button>
                      )}
                      {isMeReceiving && (
                        <span className={styles.awaitingChip}>Awaiting payment</span>
                      )}
                      {isMyTx && (
                        <button
                          className={styles.markPaidBtn}
                          onClick={() => handleMarkPaid(group.id, tx)}
                        >
                          Mark Paid
                        </button>
                      )}
                      {!isMyTx && (
                        <span className={styles.thirdPartyChip}>Between others</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}

      {payModal && (
        <PayNowModal
          tx={payModal.tx}
          group={payModal.group}
          groupTransactions={payModal.transactions}
          onClose={() => setPayModal(null)}
          onPaid={() => handleMarkPaid(payModal.group.id, payModal.tx)}
        />
      )}
    </AppLayout>
  )
}
