import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Aplica tema salvo
const theme = localStorage.getItem('theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
if (theme === 'dark' || (!theme && prefersDark)) {
  document.documentElement.classList.add('dark')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
