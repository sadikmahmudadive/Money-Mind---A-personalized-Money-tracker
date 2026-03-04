import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { uploadToCloudinary } from '../cloudinary'
import { CURRENCIES } from '../utils/formatCurrency'
import toast from 'react-hot-toast'
import { HiCamera } from 'react-icons/hi'

export default function Profile() {
  const { user, profile, updateUserProfile } = useAuth()

  const [name,     setName]     = useState(profile?.name     ?? user?.displayName ?? '')
  const [currency, setCurrency] = useState(profile?.currency ?? 'BDT')
  const [photo,    setPhoto]    = useState(null)
  const [preview,  setPreview]  = useState(profile?.photoURL || user?.photoURL || '')
  const [busy,     setBusy]     = useState(false)
  const fileRef = useRef()

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { toast.error('Image too large (max 5 MB)'); return }
    setPhoto(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Name cannot be empty'); return }
    setBusy(true)
    try {
      let photoURL = profile?.photoURL ?? ''
      if (photo) {
        toast.loading('Uploading avatar…', { id: 'avatar' })
        photoURL = await uploadToCloudinary(photo, 'avatars')
        toast.dismiss('avatar')
      }
      await updateUserProfile({ name: name.trim(), currency, photoURL })
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message ?? 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  const initials = (name || 'U').charAt(0).toUpperCase()

  return (
    <div className="max-w-lg mx-auto animate-fadeIn space-y-6">
      <h1 className="text-2xl font-extrabold">Profile Settings</h1>

      {/* Avatar */}
      <div className="card flex flex-col items-center gap-4">
        <div className="relative">
          {preview
            ? <img src={preview} alt="avatar" className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-200" />
            : <div className="w-24 h-24 rounded-full bg-primary-500 text-white text-3xl font-bold flex items-center justify-center ring-4 ring-primary-200">{initials}</div>
          }
          <button onClick={() => fileRef.current.click()}
            className="absolute bottom-0 right-0 bg-primary-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-600 transition">
            <HiCamera className="w-4 h-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
        <div className="text-center">
          <p className="font-semibold">{profile?.name ?? user?.displayName}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="card space-y-5">
        <div>
          <label className="label">Full Name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div>
          <label className="label">Email</label>
            <input className="input opacity-60 cursor-not-allowed" value={user?.email ?? ''} disabled />
        </div>

        <div>
          <label className="label">Currency</label>
          <select className="input" value={currency} onChange={e => setCurrency(e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <p className="text-xs text-gray-400 mt-1">All amounts will be displayed in the selected currency</p>
        </div>

        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {/* Account info */}
      <div className="card space-y-2">
        <h3 className="font-semibold text-sm mb-2">Account Info</h3>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Provider</span>
          <span className="font-medium capitalize">{user?.providerData?.[0]?.providerId?.replace('.com','') ?? 'email'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">User ID</span>
          <span className="font-mono text-xs text-gray-500 truncate max-w-[180px]">{user?.uid}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Member Since</span>
          <span className="font-medium">
            {user?.metadata?.creationTime
              ? new Date(user.metadata.creationTime).toLocaleDateString()
              : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
