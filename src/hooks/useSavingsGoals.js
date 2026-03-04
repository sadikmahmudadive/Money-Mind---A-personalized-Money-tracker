import { useEffect, useState, useCallback } from 'react'
import {
  collection, addDoc, deleteDoc, updateDoc,
  doc, query, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useSavingsGoals() {
  const { user } = useAuth()
  const [goals, setGoals]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'users', user.uid, 'goals'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user])

  const addGoal = useCallback(async (data) => {
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'goals'), {
      ...data,
      targetAmount: Number(data.targetAmount),
      savedAmount:  0,
      createdAt:    serverTimestamp(),
    })
  }, [user])

  const deleteGoal = useCallback(async (id) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'goals', id))
  }, [user])

  const addContribution = useCallback(async (id, amount) => {
    if (!user) return
    const goal = goals.find(g => g.id === id)
    if (!goal) return
    const newSaved = Math.min(
      (goal.savedAmount ?? 0) + Number(amount),
      goal.targetAmount
    )
    await updateDoc(doc(db, 'users', user.uid, 'goals', id), {
      savedAmount: newSaved,
    })
  }, [user, goals])

  return { goals, loading, addGoal, deleteGoal, addContribution }
}
