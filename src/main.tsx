import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/be-vietnam-pro/400.css'
import '@fontsource/be-vietnam-pro/500.css'
import '@fontsource/be-vietnam-pro/700.css'
import '@fontsource/be-vietnam-pro/800.css'
import App from './App'
import { PreferencesProvider } from './lib/preferences'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><PreferencesProvider><BrowserRouter><App /></BrowserRouter></PreferencesProvider></React.StrictMode>,
)
