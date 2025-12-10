import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TestWhoop from './TestWhoop.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {window.location.pathname === '/test' ? <TestWhoop /> : <App />}
    </StrictMode>,
)
