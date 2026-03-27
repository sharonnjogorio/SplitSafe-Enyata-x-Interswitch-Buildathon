import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/index'
import { useApp } from '../../hooks/index'
import { computeNetBalance } from '../../utils/balances'
import { formatNaira } from '../../utils/formatters'
import GroupCard from '../../components/dashboard/GroupCard'
import AppLayout from '../../layouts/AppLayout'
import styles from './GroupsPage.module.css'

export default function GroupsPage() {
  const { user }   = useAuth()
  const { groups, createGroup } = useApp()
  const navigate   = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const totalOwed = groups.reduce((s, g) => {
    const n = computeNetBalance(g, user.id)
    return s + (n > 0 ? n : 0)
  }, 0)
  const totalOwe = groups.reduce((s, g) => {
    const n = computeNetBalance(g, user.id)
    return s + (n < 0 ? Math.abs(n) : 0)
  }, 0)

  async function handleCreate() {
    if (!newGroupName.trim()) return
    const id = await createGroup(newGroupName.trim(), [{ id: user.id, name: user.name || 'You' }])
    setShowModal(false)
    setNewGroupName('')
    navigate(`/groups/${id}`)
  }

  return (
    <AppLayout>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Groups</h1>
          <p className={styles.pageSubtitle}>Manage shared expenses across all your groups</p>
        </div>
        <button className={styles.createBtn} onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" className={styles.createBtnIcon}>
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Group
        </button>
      </div>

      {/* Summary strip */}
      <div className={styles.summaryStrip}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Groups</span>
          <span className={styles.summaryValue}>{groups.length}</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>You Are Owed</span>
          <span className={`${styles.summaryValue} ${styles.pos}`}>{formatNaira(totalOwed)}</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>You Owe</span>
          <span className={`${styles.summaryValue} ${styles.neg}`}>{formatNaira(totalOwe)}</span>
        </div>
      </div>

      {/* Section label */}
      <div className={styles.sectionRow}>
        <span className={styles.sectionLabel}>All Groups</span>
        <span className={styles.sectionCount}>{groups.length} active</span>
      </div>

      {/* Groups grid */}
      {groups.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
              <circle cx="19" cy="9" r="2"/><path d="M23 21v-1a3 3 0 0 0-2-2.83"/>
            </svg>
          </div>
          <p className={styles.emptyTitle}>No groups yet</p>
          <p className={styles.emptyDesc}>Create a group to start splitting expenses with friends and family.</p>
          <button className={styles.emptyBtn} onClick={() => setShowModal(true)}>Create your first group</button>
        </div>
      ) : (
        <div className={styles.groupsGrid}>
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} userId={user.id} />
          ))}
        </div>
      )}

      {/* Create group modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create New Group</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className={styles.modalDesc}>Give your group a name to get started.</p>
            <input
              className={styles.modalInput}
              placeholder="e.g. Summer Road Trip"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setShowModal(false)}>Cancel</button>
              <button className={styles.modalConfirm} onClick={handleCreate}>Create Group</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
