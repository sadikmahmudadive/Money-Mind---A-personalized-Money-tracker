import { useEffect, useState, useCallback } from 'react'
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useWallets() {
  const { user } = useAuth()
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(collection(db, 'users', user.uid, 'wallets'), snap => {
      setWallets(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user])

  const addWallet = useCallback(async (wallet) => {
    if (!user) return
    const id = Date.now().toString()
    await setDoc(doc(db, 'users', user.uid, 'wallets', id), {
      name: wallet.name,
      type: wallet.type || 'cash',
      balance: Number(wallet.balance) || 0,
      color: wallet.color || '#6366f1',
      icon: wallet.icon || '💳',
      createdAt: new Date().toISOString(),
    })
  }, [user])

  const updateWallet = useCallback(async (id, data) => {
    if (!user) return
    await setDoc(doc(db, 'users', user.uid, 'wallets', id), data, { merge: true })
  }, [user])

  const deleteWallet = useCallback(async (id) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'wallets', id))
  }, [user])

  return { wallets, loading, addWallet, updateWallet, deleteWallet }
}
