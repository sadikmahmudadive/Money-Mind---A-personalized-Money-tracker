import { useEffect, useState, useCallback } from 'react'
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useCustomCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(collection(db, 'users', user.uid, 'customCategories'), snap => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user])

  const addCategory = useCallback(async (cat) => {
    if (!user) return
    const id = cat.name.toLowerCase().replace(/\s+/g, '-')
    await setDoc(doc(db, 'users', user.uid, 'customCategories', id), {
      name: cat.name,
      icon: cat.icon || '📁',
      color: cat.color || '#6366f1',
      type: cat.type || 'expense',
    })
  }, [user])

  const deleteCategory = useCallback(async (id) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'customCategories', id))
  }, [user])

  return { categories, loading, addCategory, deleteCategory }
}
