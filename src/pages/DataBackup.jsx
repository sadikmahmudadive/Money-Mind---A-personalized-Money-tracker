import { useState } from 'react'
import { collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { HiDownload, HiUpload, HiShieldCheck } from 'react-icons/hi'
import { format } from 'date-fns'

const COLLECTIONS = ['transactions', 'budgets', 'recurring', 'goals', 'splits']

export default function DataBackup() {
  const { user } = useAuth()
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [lastBackup, setLastBackup] = useState(null)

  async function handleExport() {
    if (!user) return
    setExporting(true)
    try {
      const backup = { version: 1, exportedAt: new Date().toISOString(), uid: user.uid, data: {} }

      for (const col of COLLECTIONS) {
        const snap = await getDocs(collection(db, 'users', user.uid, col))
        backup.data[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      }

      // Also profile
      const profileSnap = await getDocs(collection(db, 'users', user.uid, 'profile'))
      backup.data.profile = profileSnap.docs.map(d => ({ id: d.id, ...d.data() }))

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `money-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
      a.click()
      URL.revokeObjectURL(url)

      setLastBackup(new Date().toISOString())
      toast.success('Backup downloaded successfully!')
    } catch (err) {
      toast.error('Export failed: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setImporting(true)
    try {
      const text = await file.text()
      const backup = JSON.parse(text)

      if (!backup.version || !backup.data) {
        throw new Error('Invalid backup file format')
      }

      let totalDocs = 0
      for (const col of COLLECTIONS) {
        const items = backup.data[col]
        if (!Array.isArray(items)) continue

        const batch = writeBatch(db)
        items.forEach(item => {
          const { id, ...data } = item
          const ref = doc(db, 'users', user.uid, col, id)
          batch.set(ref, data, { merge: true })
          totalDocs++
        })
        await batch.commit()
      }

      // Restore profile
      if (Array.isArray(backup.data.profile)) {
        for (const item of backup.data.profile) {
          const { id, ...data } = item
          await setDoc(doc(db, 'users', user.uid, 'profile', id), data, { merge: true })
          totalDocs++
        }
      }

      toast.success(`Restored ${totalDocs} documents successfully!`)
    } catch (err) {
      toast.error('Import failed: ' + err.message)
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-extrabold">Data Backup & Restore</h1>

      <div className="card space-y-2 text-center py-8">
        <HiShieldCheck className="w-12 h-12 mx-auto text-primary-500 mb-2" />
        <h2 className="font-bold text-lg">Keep Your Data Safe</h2>
        <p className="text-sm text-gray-500">Export all your transactions, budgets, goals and settings as a JSON file. Restore from any backup anytime.</p>
      </div>

      {/* Export */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
            <HiDownload className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold">Export Backup</h3>
            <p className="text-sm text-gray-500 mt-1">Download all your data as a JSON file</p>
            {lastBackup && (
              <p className="text-xs text-gray-400 mt-1">Last backup: {format(new Date(lastBackup), 'PPp')}</p>
            )}
            <button onClick={handleExport} disabled={exporting}
              className="btn-primary mt-3 text-sm flex items-center gap-2 disabled:opacity-50">
              <HiDownload className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Download Backup'}
            </button>
          </div>
        </div>
      </div>

      {/* Import */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <HiUpload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold">Restore from Backup</h3>
            <p className="text-sm text-gray-500 mt-1">Import a previously exported JSON backup file. Existing data will be merged.</p>
            <label className={`btn-primary mt-3 text-sm inline-flex items-center gap-2 cursor-pointer ${importing ? 'opacity-50 pointer-events-none' : ''}`}>
              <HiUpload className="w-4 h-4" />
              {importing ? 'Restoring...' : 'Choose Backup File'}
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="card bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">💡 Tips</p>
        <ul className="text-xs text-amber-600 dark:text-amber-400/80 mt-2 space-y-1 list-disc list-inside">
          <li>Backup regularly — we recommend weekly</li>
          <li>Store backup files in a safe location (cloud drive, etc.)</li>
          <li>Restore merges with existing data — it won't delete anything</li>
          <li>Includes: transactions, budgets, recurring bills, savings goals, and splits</li>
        </ul>
      </div>
    </div>
  )
}
