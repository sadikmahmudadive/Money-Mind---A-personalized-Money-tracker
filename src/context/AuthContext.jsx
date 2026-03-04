import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Helpers ────────────────────────────────────────────────────────────────
  async function fetchProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid, 'profile', 'data'))
    if (snap.exists()) setProfile(snap.data())
  }

  async function createProfile(uid, data) {
    await setDoc(doc(db, 'users', uid, 'profile', 'data'), {
      ...data,
      currency:   data.currency ?? 'BDT',
      createdAt:  serverTimestamp(),
    })
    setProfile(data)
  }

  // ── Auth methods ───────────────────────────────────────────────────────────
  async function register(email, password, name) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    await createProfile(cred.user.uid, { name, email, photoURL: '', currency: 'BDT' })
    return cred
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function loginWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider)
    const snap = await getDoc(doc(db, 'users', cred.user.uid, 'profile', 'data'))
    if (!snap.exists()) {
      await createProfile(cred.user.uid, {
        name:     cred.user.displayName ?? '',
        email:    cred.user.email,
        photoURL: cred.user.photoURL ?? '',
        currency: 'BDT',
      })
    } else {
      setProfile(snap.data())
    }
    return cred
  }

  async function logout() {
    await signOut(auth)
    setProfile(null)
  }

  async function updateUserProfile(data) {
    if (!user) return
    await setDoc(doc(db, 'users', user.uid, 'profile', 'data'), data, { merge: true })
    setProfile(prev => ({ ...prev, ...data }))
    if (data.name) await updateProfile(auth.currentUser, { displayName: data.name })
    if (data.photoURL) await updateProfile(auth.currentUser, { photoURL: data.photoURL })
  }

  // ── Listener ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) await fetchProfile(u.uid)
      setLoading(false)
    })
    return unsub
  }, [])

  const value = { user, profile, loading, register, login, loginWithGoogle, logout, updateUserProfile }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
