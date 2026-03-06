import { useEffect, useState, useCallback } from 'react'
import { collection, doc, setDoc, deleteDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useDebts() {
  const { user } = useAuth()
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(collection(db, 'users', user.uid, 'debts'), snap => {
      setDebts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user])

  const addDebt = useCallback(async (debt) => {
    if (!user) return
    const id = Date.now().toString()
    await setDoc(doc(db, 'users', user.uid, 'debts', id), {
      title: debt.title,
      person: debt.person,
      amount: Number(debt.amount) || 0,
      paid: 0,
      direction: debt.direction || 'borrowed', // 'borrowed' or 'lent'
      interestRate: Number(debt.interestRate) || 0,
      dueDate: debt.dueDate || '',
      notes: debt.notes || '',
      createdAt: new Date().toISOString(),
    })
  }, [user])

  const makePayment = useCallback(async (id, amount) => {
    if (!user) return
    const debt = debts.find(d => d.id === id)
    if (!debt) return
    await updateDoc(doc(db, 'users', user.uid, 'debts', id), {
      paid: (debt.paid ?? 0) + Number(amount),
    })
  }, [user, debts])

  const deleteDebt = useCallback(async (id) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'debts', id))
  }, [user])

  return { debts, loading, addDebt, makePayment, deleteDebt }
}
