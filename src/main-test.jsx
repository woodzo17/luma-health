import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TestWhoop from './TestWhoop.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <TestWhoop />
    </StrictMode>,
)
