import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LandingPage from './LandingPage.jsx'
import OwnerDashboard from './OwnerDashboard.jsx'

const rawPath = window.location.pathname || '/'
const path = rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath
const Page = path === '/' ? LandingPage : path === '/owner' ? OwnerDashboard : App

function NetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  if (online) return null
  return (
    <div role="status" style={{ position: 'fixed', zIndex: 99999, top: 0, left: 0, right: 0, padding: '8px 12px', textAlign: 'center', background: '#fff0c2', color: '#593d00', fontSize: 13, fontWeight: 600 }}>
      You’re offline. The app shell may open, but live records and changes need an internet connection.
    </div>
  )
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Invoice Chaser offline support could not be registered:', error)
    })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NetworkStatus />
    <Page />
  </StrictMode>,
)
