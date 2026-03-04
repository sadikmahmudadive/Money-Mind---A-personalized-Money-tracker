import { useEffect, useState, useCallback } from 'react'
import {
  collection, doc, setDoc, deleteDoc, onSnapshot,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useBudgets() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(collection(db, 'users', user.uid, 'budgets'), snap => {
      setBudgets(snap.docs.map(d => ({ category: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user])

  const setBudget = useCallback(async (category, limit) => {
    if (!user) return
    await setDoc(doc(db, 'users', user.uid, 'budgets', category), { limit: Number(limit) }, { merge: true })
  }, [user])

  const updateSpent = useCallback(async (category, spent) => {
    if (!user) return
    await setDoc(doc(db, 'users', user.uid, 'budgets', category), { spent: Number(spent) }, { merge: true })
  }, [user])

  const deleteBudget = useCallback(async (category) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'budgets', category))
  }, [user])

  return { budgets, loading, setBudget, updateSpent, deleteBudget }
}
