import { useState, useEffect } from 'react'
import { paymentService } from '../services/paymentService'
import { formatNaira, formatDate } from '../utils/formatters'
import AppLayout from '../layouts/AppLayout'
import styles from './PaymentHistoryPage.module.css'

const STATUS_LABELS = {
  success:  'Paid',
  pending:  'Pending',
  failed:   'Failed',
}

const STATUS_STYLES = {
  success: 'chipSuccess',
  pending: 'chipPending',
  failed:  'chipFailed',
}

export default function PaymentHistoryPage() {
  const [transactions, setTransactions] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  useEffect(() => {
    paymentService.getHistory()
      .then(data => setTransactions(data.transactions || []))
      .catch(err  => setError(err.message || 'Failed to load payment history'))
      .finally(()  => setLoading(false))
  }, [])

  return (
    <AppLayout>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Payment History</h1>
        <p className={styles.pageSubtitle}>All transactions processed through SplitSafe</p>
      </div>

      {loading && <p className={styles.stateMsg}>Loading transactions…</p>}
      {error   && <p className={styles.errorMsg}>{error}</p>}

      {!loading && !error && transactions.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" width="36" height="36">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          </div>
          <p className={styles.emptyTitle}>No transactions yet</p>
          <p className={styles.emptyDesc}>Your completed payments will appear here.</p>
        </div>
      )}

      {!loading && transactions.length > 0 && (
        <div className={styles.tableWrapper}>
          <div className={styles.tableHead}>
            <span className={styles.colDate}>Date</span>
            <span className={styles.colDesc}>Description</span>
            <span className={styles.colRecipient}>Recipient</span>
            <span className={styles.colAmount}>Amount</span>
            <span className={styles.colStatus}>Status</span>
          </div>

          <div className={styles.tableBody}>
            {transactions.map((tx) => {
              const status = tx.status || 'pending'
              return (
                <div key={tx._id || tx.id} className={styles.tableRow}>
                  <span className={styles.colDate}>
                    {formatDate(tx.createdAt || tx.date)}
                  </span>
                  <span className={styles.colDesc}>
                    {tx.description || 'Settlement payment'}
                  </span>
                  <span className={styles.colRecipient}>
                    {tx.to?.name || tx.toName || '—'}
                  </span>
                  <span className={styles.colAmount}>
                    {formatNaira(tx.amount)}
                  </span>
                  <span className={styles.colStatus}>
                    <span className={`${styles.chip} ${styles[STATUS_STYLES[status] || 'chipPending']}`}>
                      {STATUS_LABELS[status] || status}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
