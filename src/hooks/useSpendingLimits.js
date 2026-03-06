import { useEffect, useState, useCallback } from 'react'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useSpendingLimits() {
  const { user } = useAuth()
  const [limits, setLimits] = useState({ daily: 0, weekly: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(doc(db, 'users', user.uid, 'settings', 'spendingLimits'), snap => {
      if (snap.exists()) setLimits(snap.data())
      setLoading(false)
    })
    return unsub
  }, [user])

  const setSpendingLimits = useCallback(async (daily, weekly) => {
    if (!user) return
    await setDoc(doc(db, 'users', user.uid, 'settings', 'spendingLimits'), {
      daily: Number(daily) || 0,
      weekly: Number(weekly) || 0,
    })
  }, [user])

  return { limits, loading, setSpendingLimits }
}
