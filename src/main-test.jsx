import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import WhoopDashboard from './components/WhoopDashboard.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <WhoopDashboard />
    </StrictMode>,
)
