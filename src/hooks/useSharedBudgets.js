import { useEffect, useState, useCallback } from 'react'
import { collection, doc, setDoc, deleteDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useSharedBudgets() {
  const { user } = useAuth()
  const [sharedBudgets, setSharedBudgets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(collection(db, 'users', user.uid, 'sharedBudgets'), snap => {
      setSharedBudgets(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user])

  const createSharedBudget = useCallback(async (budget) => {
    if (!user) return
    const id = Date.now().toString()
    await setDoc(doc(db, 'users', user.uid, 'sharedBudgets', id), {
      name: budget.name,
      limit: Number(budget.limit) || 0,
      spent: 0,
      members: [user.email],
      category: budget.category || 'Other',
      createdBy: user.email,
      createdAt: new Date().toISOString(),
    })
  }, [user])

  const addMember = useCallback(async (budgetId, email) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'sharedBudgets', budgetId), {
      members: arrayUnion(email),
    })
  }, [user])

  const removeMember = useCallback(async (budgetId, email) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'sharedBudgets', budgetId), {
      members: arrayRemove(email),
    })
  }, [user])

  const addExpense = useCallback(async (budgetId, amount) => {
    if (!user) return
    const budget = sharedBudgets.find(b => b.id === budgetId)
    if (!budget) return
    await updateDoc(doc(db, 'users', user.uid, 'sharedBudgets', budgetId), {
      spent: (budget.spent ?? 0) + Number(amount),
    })
  }, [user, sharedBudgets])

  const deleteSharedBudget = useCallback(async (id) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'sharedBudgets', id))
  }, [user])

  return { sharedBudgets, loading, createSharedBudget, addMember, removeMember, addExpense, deleteSharedBudget }
}
