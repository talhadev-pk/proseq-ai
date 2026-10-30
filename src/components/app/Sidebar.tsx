import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarRange,
  ChevronLeft,
  FileText,
  History,
  LayoutDashboard,
  LayoutTemplate,
  Mic,
  PenLine,
  Settings,
  X,
} from 'lucide-react'
import { Logo, LogoMark } from '@/components/brand/Logo'
import { useUIStore } from '@/store/ui'
import { cn } from '@/lib/utils'

export const NAV_ITEMS = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/writer', label: 'AI Writer', icon: PenLine, end: false },
  { to: '/app/documents', label: 'Documents', icon: FileText, end: false },
  { to: '/app/templates', label: 'Templates', icon: LayoutTemplate, end: false },
  { to: '/app/brand-voice', label: 'Brand Voice', icon: Mic, end: false },
  { to: '/app/planner', label: 'Content Planner', icon: CalendarRange, end: false },
  { to: '/app/history', label: 'History', icon: History, end: false },
  { to: '/app/settings', label: 'Settings', icon: Settings, end: false },
] as const

function NavLinks({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav aria-label="Application" className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-sand text-ink'
                : 'text-muted hover:bg-sand/60 hover:text-ink',
              collapsed && 'justify-center px-0',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <motion.span
                  layoutId="nav-active-bar"
                  className="absolute left-0 h-5 w-1 rounded-r-full bg-violet"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              ) : null}
              <item.icon className="size-4.5 shrink-0" aria-hidden />
              {!collapsed ? <span>{item.label}</span> : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('border-t border-line px-5 py-4', collapsed && 'px-0 text-center')}>
      {collapsed ? (
        <LogoMark className="mx-auto size-6 opacity-60" />
      ) : (
        <>
          <p className="text-[11px] leading-relaxed text-faint">
            Demo edition — data lives in your browser.
          </p>
          <p className="mt-1 text-[11px] text-muted">
            Made with <span aria-label="love">❤</span> by Talha
          </p>
        </>
      )}
    </div>
  )
}

/** Desktop sidebar — collapsible. */
export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggle = useUIStore((s) => s.toggleSidebar)

  return (
    <motion.aside
      aria-label="Sidebar"
      className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-paper lg:flex"
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <div className={cn('flex h-16 items-center border-b border-line px-5', collapsed && 'justify-center px-0')}>
        {collapsed ? <LogoMark className="size-8" /> : <Logo />}
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <NavLinks collapsed={collapsed} />
      </div>
      <SidebarFooter collapsed={collapsed} />
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-[4.6rem] z-10 flex size-6 items-center justify-center rounded-full border border-line bg-paper text-faint shadow-soft transition-colors hover:text-ink"
      >
        <ChevronLeft className={cn('size-3.5 transition-transform duration-200', collapsed && 'rotate-180')} />
      </button>
    </motion.aside>
  )
}

/** Mobile navigation drawer. */
export function MobileNav() {
  const open = useUIStore((s) => s.mobileNavOpen)
  const setOpen = useUIStore((s) => s.setMobileNav)

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-ink/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-line bg-paper shadow-pop"
            initial={{ x: -290 }}
            animate={{ x: 0 }}
            exit={{ x: -290 }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="rounded-lg p-1.5 text-faint transition-colors hover:bg-sand hover:text-ink"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <NavLinks collapsed={false} onNavigate={() => setOpen(false)} />
            </div>
            <SidebarFooter collapsed={false} />
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
