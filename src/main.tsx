import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New SW update available')
  },
  onOfflineReady() {
    console.log('App ready offline')
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <button onClick={() => updateSW?.()}>بروزرسانی سرویس‌ورکر</button>
  </React.StrictMode>
)
