import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { uploadToCloudinary } from '../cloudinary'
import { CURRENCIES } from '../utils/formatCurrency'
import toast from 'react-hot-toast'
import { HiCamera, HiUser, HiCog, HiShieldCheck } from 'react-icons/hi'

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
  const provider  = user?.providerData?.[0]?.providerId?.replace('.com', '') ?? 'email'

  return (
    <div className="max-w-lg mx-auto animate-fadeIn space-y-6">

      {/* Hero avatar card */}
      <div className="rounded-2xl overflow-hidden shadow-card-lg border border-gray-100 dark:border-gray-800">
        {/* Gradient banner */}
        <div
          className="h-28 relative"
          style={{ background: 'linear-gradient(135deg,#0ea5e9 0%,#7c3aed 60%,#ec4899 100%)' }}
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,white_0%,transparent_60%)]" />
        </div>

        {/* Avatar + info */}
        <div className="bg-white dark:bg-gray-900 px-6 pb-5 relative">
          <div className="flex items-end gap-3 sm:gap-4 -mt-12 mb-4">
            <div className="relative shrink-0">
              {preview
                ? <img src={preview} alt="avatar"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-gray-900 shadow-lg" />
                : <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-purple-600
                                  text-white text-2xl sm:text-3xl font-bold flex items-center justify-center
                                  ring-4 ring-white dark:ring-gray-900 shadow-lg">
                    {initials}
                  </div>
              }
              <button
                onClick={() => fileRef.current.click()}
                className="absolute -bottom-1.5 -right-1.5 bg-primary-500 hover:bg-primary-600
                           text-white w-7 h-7 rounded-xl flex items-center justify-center shadow-md transition"
              >
                <HiCamera className="w-3.5 h-3.5" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>

            <div className="pb-1 min-w-0">
              <p className="font-extrabold text-lg text-gray-900 dark:text-white truncate">
                {profile?.name ?? user?.displayName ?? 'User'}
              </p>
              <p className="text-sm text-gray-400 truncate">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold
                               bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                <HiShieldCheck className="w-3 h-3" />
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="card space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <HiCog className="w-4 h-4 text-primary-500" />
          <h2 className="font-bold text-gray-800 dark:text-gray-200">Account Settings</h2>
        </div>
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
      <div className="card space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <HiUser className="w-4 h-4 text-primary-500" />
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Account Info</h3>
        </div>
        {[
          { label: 'Provider',      value: provider.charAt(0).toUpperCase() + provider.slice(1) },
          { label: 'User ID',       value: user?.uid, mono: true },
          { label: 'Member Since',  value: user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '—' },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
            <span className="text-xs text-gray-400 font-medium">{row.label}</span>
            <span className={`text-xs font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[200px] ${
              row.mono ? 'font-mono text-gray-500' : ''
            }`}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
