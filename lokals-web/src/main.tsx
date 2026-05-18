import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.tsx'
import { NotificationToastProvider } from './providers/NotificationToastProvider.tsx'
import { AppBootstrapProvider } from './providers/AppBootstrapProvider.tsx'
import { ThemeProvider } from './providers/ThemeProvider.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppBootstrapProvider>
            <NotificationToastProvider>
              <App />
            </NotificationToastProvider>
          </AppBootstrapProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
