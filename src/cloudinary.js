// src/cloudinary.js
// ─── Replace with your Cloudinary cloud name and unsigned upload preset ────────
const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/**
 * Uploads a file to Cloudinary and returns the secure URL.
 * @param {File}   file   - The file to upload
 * @param {string} folder - Cloudinary folder (e.g. "receipts" or "avatars")
 * @returns {Promise<string>} secure URL
 */
export async function uploadToCloudinary(file, folder = 'money-tracker') {
  const formData = new FormData()
  formData.append('file',           file)
  formData.append('upload_preset',  UPLOAD_PRESET)
  formData.append('folder',         folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message ?? 'Cloudinary upload failed')
  }

  const data = await res.json()
  return data.secure_url
}
