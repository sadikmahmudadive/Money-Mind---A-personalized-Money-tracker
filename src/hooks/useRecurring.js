import { useEffect, useState, useCallback } from 'react'
import {
  collection, addDoc, deleteDoc, updateDoc,
  doc, query, orderBy, onSnapshot, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export function useRecurring() {
  const { user } = useAuth()
  const [recurring, setRecurring] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'users', user.uid, 'recurring'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      setRecurring(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user])

  const addRecurring = useCallback(async (data) => {
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'recurring'), {
      ...data,
      amount:      Number(data.amount),
      active:      true,
      lastApplied: '',
      createdAt:   serverTimestamp(),
    })
  }, [user])

  const deleteRecurring = useCallback(async (id) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'recurring', id))
  }, [user])

  const toggleActive = useCallback(async (id, active) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'recurring', id), { active })
  }, [user])

  /**
   * Auto-apply: for each active recurring item not yet applied this month,
   * generate a transaction and mark it applied.
   */
  const autoApply = useCallback(async (addTransactionFn) => {
    if (!user || !recurring.length) return
    const currentMonth = format(new Date(), 'yyyy-MM')
    const generated = []

    for (const r of recurring) {
      if (!r.active) continue
      if (r.lastApplied === currentMonth) continue

      const dueDay = r.dueDay ?? 1
      const now = new Date()
      const due = new Date(now.getFullYear(), now.getMonth(), Math.min(dueDay, 28))

      try {
        await addTransactionFn({
          type:      r.type,
          title:     r.title,
          amount:    r.amount,
          category:  r.category,
          notes:     `Auto-applied (recurring)${r.notes ? ': ' + r.notes : ''}`,
          date:      Timestamp.fromDate(due),
        })
        await updateDoc(doc(db, 'users', user.uid, 'recurring', r.id), {
          lastApplied: currentMonth,
        })
        generated.push(r.title)
      } catch (err) {
        console.error('Failed to auto-apply recurring:', r.title, err)
      }
    }

    if (generated.length > 0) {
      toast.success(
        `Auto-added ${generated.length} recurring transaction${generated.length > 1 ? 's' : ''}: ` +
        generated.slice(0, 2).join(', ') + (generated.length > 2 ? '…' : '')
      )
    }
  }, [user, recurring])

  /** Items due within the next N days this month */
  function getDueSoon(days = 7) {
    const today = new Date()
    const maxDay = today.getDate() + days
    return recurring.filter(r => {
      if (!r.active) return false
      const d = r.dueDay ?? 1
      return d >= today.getDate() && d <= maxDay
    })
  }

  return { recurring, loading, addRecurring, deleteRecurring, toggleActive, autoApply, getDueSoon }
}
