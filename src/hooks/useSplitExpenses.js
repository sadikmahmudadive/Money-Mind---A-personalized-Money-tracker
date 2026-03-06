import { useEffect, useState, useCallback } from 'react'
import {
  collection, addDoc, deleteDoc, updateDoc,
  doc, query, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useSplitExpenses() {
  const { user } = useAuth()
  const [splits, setSplits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'users', user.uid, 'splits'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      setSplits(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user])

  const addSplit = useCallback(async (data) => {
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'splits'), {
      ...data,
      totalAmount: Number(data.totalAmount),
      createdAt: serverTimestamp(),
    })
  }, [user])

  const deleteSplit = useCallback(async (id) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'splits', id))
  }, [user])

  const toggleSettled = useCallback(async (splitId, friendName, settled) => {
    if (!user) return
    const split = splits.find(s => s.id === splitId)
    if (!split) return
    const updatedFriends = split.friends.map(f =>
      f.name === friendName ? { ...f, settled } : f
    )
    await updateDoc(doc(db, 'users', user.uid, 'splits', splitId), {
      friends: updatedFriends,
    })
  }, [user, splits])

  // Derived stats
  const totalOwed = splits.reduce((sum, s) => {
    return sum + s.friends.filter(f => !f.settled).reduce((a, f) => a + f.share, 0)
  }, 0)

  const totalSettled = splits.reduce((sum, s) => {
    return sum + s.friends.filter(f => f.settled).reduce((a, f) => a + f.share, 0)
  }, 0)

  return { splits, loading, addSplit, deleteSplit, toggleSettled, totalOwed, totalSettled }
}
