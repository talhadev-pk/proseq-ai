import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/brand/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const links = [
  { to: '/features', label: 'Features' },
  { to: '/templates', label: 'Templates' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-all duration-300',
        scrolled
          ? 'border-line bg-bg/85 shadow-soft backdrop-blur-md'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="ProseQ AI home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-sand text-ink' : 'text-muted hover:bg-sand/70 hover:text-ink',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle size="sm" />
          <Link to="/app" className="hidden sm:block">
            <Button size="sm" iconRight={<ArrowRight className="size-4" />}>
              Start writing
            </Button>
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-lg p-2 text-ink transition-colors hover:bg-sand lg:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.nav
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden border-t border-line bg-bg lg:hidden"
          >
            <div className="container-site flex flex-col gap-1 py-4">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3.5 py-2.5 text-sm font-medium',
                      isActive ? 'bg-sand text-ink' : 'text-muted hover:bg-sand/70',
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <Link to="/app" className="mt-2">
                <Button className="w-full" iconRight={<ArrowRight className="size-4" />}>
                  Start writing
                </Button>
              </Link>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
