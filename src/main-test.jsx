import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import WhoopDashboard from './components/WhoopDashboard.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ErrorBoundary>
            <WhoopDashboard />
        </ErrorBoundary>
    </StrictMode>,
)
