import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LandingPage from './LandingPage.jsx'
import OwnerDashboard from './OwnerDashboard.jsx'

const path = window.location.pathname.replace(/\\/$/, '') || '/'
const Page = path === '/' ? LandingPage : path === '/owner' ? OwnerDashboard : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
