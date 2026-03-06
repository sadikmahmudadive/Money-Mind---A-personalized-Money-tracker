import { useState, useEffect, useCallback } from 'react'

const PERMISSION_KEY = 'moneymind_notif_permission'

export function useNotifications() {
  const [permission, setPermission] = useState('default')
  const [supported] = useState(() => 'Notification' in window)

  useEffect(() => {
    if (supported) {
      setPermission(Notification.permission)
    }
  }, [supported])

  const requestPermission = useCallback(async () => {
    if (!supported) return 'unsupported'
    const result = await Notification.requestPermission()
    setPermission(result)
    localStorage.setItem(PERMISSION_KEY, result)
    return result
  }, [supported])

  const sendNotification = useCallback((title, options = {}) => {
    if (!supported || permission !== 'granted') return
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      })
    } catch {
      // SW-based notification fallback not needed for this use case
    }
  }, [supported, permission])

  const scheduleBillReminders = useCallback((recurringItems, getDueSoon) => {
    if (!supported || permission !== 'granted') return

    const dueSoon = getDueSoon(3) // next 3 days
    const notifiedKey = `moneymind_notified_${new Date().toISOString().slice(0, 10)}`
    const alreadyNotified = JSON.parse(localStorage.getItem(notifiedKey) || '[]')

    dueSoon.forEach(item => {
      if (alreadyNotified.includes(item.id)) return
      sendNotification(`💰 Bill Due: ${item.title}`, {
        body: `${item.title} is due on the ${item.dueDay}${item.dueDay === 1 ? 'st' : item.dueDay === 2 ? 'nd' : item.dueDay === 3 ? 'rd' : 'th'}. Don't forget to pay!`,
        tag: `bill-${item.id}`,
      })
      alreadyNotified.push(item.id)
    })

    localStorage.setItem(notifiedKey, JSON.stringify(alreadyNotified))
  }, [supported, permission, sendNotification])

  return { supported, permission, requestPermission, sendNotification, scheduleBillReminders }
}
