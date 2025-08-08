
import ReactDOM from 'react-dom/client'
import App from './App'
import { registerSW } from 'virtual:pwa-register'
import { BrowserRouter } from 'react-router-dom'

const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New SW update available')
  },
  onOfflineReady() {
    console.log('App ready offline')
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
    <button onClick={() => updateSW()}>update service worker</button>
  </BrowserRouter>



)
