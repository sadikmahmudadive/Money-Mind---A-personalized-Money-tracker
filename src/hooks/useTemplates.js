import { useEffect, useState, useCallback } from 'react'
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useTemplates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(collection(db, 'users', user.uid, 'templates'), snap => {
      setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user])

  const addTemplate = useCallback(async (tpl) => {
    if (!user) return
    const id = Date.now().toString()
    await setDoc(doc(db, 'users', user.uid, 'templates', id), {
      title: tpl.title,
      amount: Number(tpl.amount) || 0,
      type: tpl.type || 'expense',
      category: tpl.category || 'Other',
      notes: tpl.notes || '',
      currency: tpl.currency || 'BDT',
      createdAt: new Date().toISOString(),
    })
  }, [user])

  const deleteTemplate = useCallback(async (id) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'templates', id))
  }, [user])

  return { templates, loading, addTemplate, deleteTemplate }
}
