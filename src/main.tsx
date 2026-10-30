import { StrictMode, Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/fraunces'
import '@/styles/index.css'
import App from './App'
import { bootstrapApplication } from '@/store/bootstrap'
import { useThemeEffect } from '@/hooks/useThemeEffect'
import { Toaster } from '@/components/ui/Toaster'
import { LogoMark } from '@/components/brand/Logo'

function BootSplash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg">
      <LogoMark className="size-12 animate-pulse" />
      <p className="text-sm text-faint">Preparing your workspace…</p>
    </div>
  )
}

function Root() {
  useThemeEffect()
  return (
    <>
      <App />
      <Toaster />
    </>
  )
}

function Boot() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    bootstrapApplication().finally(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!ready) return <BootSplash />
  return (
    <Suspense fallback={<BootSplash />}>
      <Root />
    </Suspense>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Boot />
  </StrictMode>,
)
