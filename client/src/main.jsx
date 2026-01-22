import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import {Provider} from 'react-redux'
import { store } from './app/store.js'

// Logs pour déboguer
console.log('=== ENVIRONMENT VARIABLES ===')
console.log('All env vars:', import.meta.env)
console.log('VITE_CLERK_PUBLISHABLE_KEY:', import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
console.log('VITE_BASEURL:', import.meta.env.VITE_BASEURL)
console.log('============================')

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

console.log('Publishable key loaded:', PUBLISHABLE_KEY ? 'YES ✅' : 'NO ❌')
console.log('Key starts with pk_:', PUBLISHABLE_KEY?.startsWith('pk_') ? 'YES ✅' : 'NO ❌')

if (!PUBLISHABLE_KEY) {
  console.error('❌ CLERK KEY IS MISSING!')
  console.error('Please check your .env file')
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </ClerkProvider>
)