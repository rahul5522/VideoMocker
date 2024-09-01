import React from 'react'

import { ThemeProvider } from './contexts/themeContext'

import './App.css'
import Home from './pages/Home'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Home />
    </ThemeProvider>
  )
}

export default App
