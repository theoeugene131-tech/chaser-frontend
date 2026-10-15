import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LandingPage from './LandingPage.jsx'
import OwnerDashboard from './OwnerDashboard.jsx'

const rawPath = window.location.pathname || '/'
const path = rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath
const Page = path === '/' ? LandingPage : path === '/owner' ? OwnerDashboard : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
