import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'


import TradingPlatform from './components/Trading-Platform/trading-platform.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TradingPlatform  />
  </StrictMode>,
)
