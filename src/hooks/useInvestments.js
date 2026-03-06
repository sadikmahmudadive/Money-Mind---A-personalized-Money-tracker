import { useEffect, useState, useCallback } from 'react'
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useInvestments() {
  const { user } = useAuth()
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(collection(db, 'users', user.uid, 'investments'), snap => {
      setInvestments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user])

  const addInvestment = useCallback(async (inv) => {
    if (!user) return
    const id = Date.now().toString()
    await setDoc(doc(db, 'users', user.uid, 'investments', id), {
      name: inv.name,
      type: inv.type || 'stock',
      buyPrice: Number(inv.buyPrice) || 0,
      currentPrice: Number(inv.currentPrice) || 0,
      quantity: Number(inv.quantity) || 1,
      buyDate: inv.buyDate || new Date().toISOString().split('T')[0],
      notes: inv.notes || '',
      createdAt: new Date().toISOString(),
    })
  }, [user])

  const updateInvestment = useCallback(async (id, data) => {
    if (!user) return
    await setDoc(doc(db, 'users', user.uid, 'investments', id), data, { merge: true })
  }, [user])

  const deleteInvestment = useCallback(async (id) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'investments', id))
  }, [user])

  return { investments, loading, addInvestment, updateInvestment, deleteInvestment }
}
