import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TestWhoop from './TestWhoop.jsx'

const path = window.location.pathname;
console.log('Current path:', path);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <div style={{position: 'fixed', top: 0, left: 0, padding: '10px', background: 'red', color: 'white', zIndex: 99999, fontSize: '20px'}}>
            DEBUG: Current Path is "{path}"
        </div>
        {path.startsWith('/test') ? <TestWhoop /> : <App />}
    </StrictMode>,
)
