import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { seedSampleData } from './lib/sampleData.ts'
import { registerSyncListener } from './lib/syncService.ts'

// Seed sample data on first load (only if database is empty)
seedSampleData().catch(console.error)

// Register background auto-sync (triggers on reconnect, disabled gracefully if no Supabase env vars)
registerSyncListener()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
