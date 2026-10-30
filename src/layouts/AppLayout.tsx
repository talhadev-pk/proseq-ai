import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar, MobileNav } from '@/components/app/Sidebar'
import { Topbar } from '@/components/app/Topbar'
import { SearchModal } from '@/components/app/SearchModal'
import { useUIStore } from '@/store/ui'
import { useDocumentsStore } from '@/store/documents'

export function AppLayout() {
  const { pathname } = useLocation()
  const setMobileNav = useUIStore((s) => s.setMobileNav)
  const setSearchOpen = useUIStore((s) => s.setSearchOpen)
  const hydrated = useDocumentsStore((s) => s.hydrated)

  // Close overlays when navigating.
  useEffect(() => {
    setMobileNav(false)
    setSearchOpen(false)
  }, [pathname, setMobileNav, setSearchOpen])

  return (
    <div className="flex min-h-screen bg-bg">
      <a
        href="#app-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-bg"
      >
        Skip to content
      </a>
      <Sidebar />
      <MobileNav />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <motion.main
          id="app-main"
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="flex-1 px-4 py-6 sm:px-6 lg:px-8"
        >
          {hydrated ? (
            <Outlet />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading workspace">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-36" />
              ))}
            </div>
          )}
        </motion.main>

        <footer className="border-t border-line px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 text-center text-[11px] text-faint sm:flex-row sm:text-left">
            <p>
              ProseQ AI — demo edition · Made with <span aria-label="love">❤</span> by Talha
            </p>
            <p>
              This is a demonstration project. AI-generated examples and displayed data may be
              simulated or illustrative.
            </p>
          </div>
        </footer>
      </div>

      <SearchModal />
    </div>
  )
}
