import { useEffect, useState, useCallback } from 'react'
import {
  collection, addDoc, deleteDoc, updateDoc,
  doc, query, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user])

  const addTransaction = useCallback(async (data) => {
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'transactions'), {
      ...data,
      amount:    Number(data.amount),
      createdAt: serverTimestamp(),
    })
  }, [user])

  const deleteTransaction = useCallback(async (id) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'transactions', id))
  }, [user])

  const updateTransaction = useCallback(async (id, data) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'transactions', id), {
      ...data,
      amount: Number(data.amount),
    })
  }, [user])

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalIncome  = transactions.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance      = totalIncome - totalExpense

  return { transactions, loading, addTransaction, deleteTransaction, updateTransaction, totalIncome, totalExpense, balance }
}
