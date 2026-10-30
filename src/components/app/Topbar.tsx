import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Check,
  FilePlus2,
  LogOut,
  Menu,
  Search,
  Settings as SettingsIcon,
  UserRound,
  X,
} from 'lucide-react'
import { useUIStore } from '@/store/ui'
import { useProfileStore } from '@/store/profile'
import { useActivityStore } from '@/store/activity'
import { useDocumentsStore } from '@/store/documents'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { Avatar } from '@/components/ui/Avatar'
import { Kbd } from '@/components/ui/Kbd'
import { ThemeToggle } from '@/components/brand/ThemeToggle'
import { toast } from '@/store/notifications'
import { timeAgo } from '@/lib/utils'

const ACTIVITY_ICONS: Record<string, string> = {
  'document-created': '📄',
  'document-saved': '💾',
  'document-deleted': '🗑️',
  'template-applied': '✨',
  'profile-updated': '👤',
  'settings-changed': '⚙️',
  'export-completed': '📤',
  'voice-updated': '🎙️',
  'planner-updated': '🗓️',
  'version-restored': '⏪',
  'import-completed': '📥',
}

export function Topbar() {
  const navigate = useNavigate()
  const setMobileNav = useUIStore((s) => s.setMobileNav)
  const setSearchOpen = useUIStore((s) => s.setSearchOpen)
  const profile = useProfileStore((s) => s.profile)
  const activity = useActivityStore((s) => s.items)
  const lastSeenAt = useActivityStore((s) => s.lastSeenAt)
  const markSeen = useActivityStore((s) => s.markSeen)
  const createDocument = useDocumentsStore((s) => s.createDocument)

  const unseen = useMemo(
    () =>
      lastSeenAt
        ? activity.filter((a) => new Date(a.at) > new Date(lastSeenAt)).length
        : Math.min(activity.length, 3),
    [activity, lastSeenAt],
  )

  const newDoc = () => {
    const doc = createDocument()
    if (doc) {
      toast.success('Document created', 'A blank page is ready for you.')
      navigate(`/app/writer?doc=${doc.id}`)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={() => setMobileNav(true)}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-ink transition-colors hover:bg-sand lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {/* Search trigger */}
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="group flex h-10 min-w-0 flex-1 max-w-md items-center gap-2.5 rounded-xl border border-line bg-paper px-3.5 text-left text-sm text-faint shadow-soft transition-colors hover:border-line-strong hover:text-muted"
        aria-label="Open search"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="flex-1 truncate">Search documents, templates, planner…</span>
        <span className="hidden items-center gap-1 sm:flex">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <ThemeToggle size="sm" />

        {/* New document */}
        <button
          type="button"
          onClick={newDoc}
          aria-label="New document"
          title="New document"
          className="hidden items-center gap-2 rounded-xl bg-ink px-3.5 text-sm font-medium text-bg transition-colors hover:bg-violet hover:text-white sm:flex"
        >
          <FilePlus2 className="size-4" aria-hidden />
          New
        </button>

        {/* Notifications */}
        <Dropdown
          width="w-80"
          label="Notifications"
          trigger={({ toggle, open }) => (
            <button
              type="button"
              onClick={() => {
                toggle()
              }}
              aria-label={`Notifications${unseen > 0 ? `, ${unseen} unseen` : ''}`}
              aria-expanded={open}
              className="relative rounded-xl p-2.5 text-muted transition-colors hover:bg-sand hover:text-ink"
            >
              <Bell className="size-4.5" aria-hidden />
              {unseen > 0 ? (
                <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-clay text-[9px] font-bold text-white">
                  {unseen > 9 ? '9+' : unseen}
                </span>
              ) : null}
            </button>
          )}
        >
          {(close) => (
            <div>
              <div className="flex items-center justify-between px-2.5 pb-2 pt-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-faint">
                  Recent activity
                </p>
                <button
                  type="button"
                  onClick={() => markSeen()}
                  className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-violet hover:bg-violet-soft"
                >
                  <Check className="size-3" aria-hidden /> Mark seen
                </button>
              </div>
              {activity.length === 0 ? (
                <p className="px-2.5 pb-3 pt-4 text-center text-xs text-faint">
                  Nothing yet — your actions will appear here.
                </p>
              ) : (
                <ul className="max-h-80 overflow-y-auto">
                  {activity.slice(0, 8).map((a) => (
                    <li
                      key={a.id}
                      className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-sand/70"
                    >
                      <span className="mt-0.5 text-sm" aria-hidden>
                        {ACTIVITY_ICONS[a.type] ?? '•'}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] text-ink">{a.message}</p>
                        <p className="text-[11px] text-faint">{timeAgo(a.at)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-1 border-t border-line pt-1">
                <DropdownItem icon={<X className="size-4" />} onClick={close}>
                  Close
                </DropdownItem>
              </div>
            </div>
          )}
        </Dropdown>

        {/* Profile menu */}
        <Dropdown
          label="Account"
          trigger={({ toggle, open }) => (
            <button
              type="button"
              onClick={toggle}
              aria-label="Open account menu"
              aria-expanded={open}
              className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-sand"
            >
              <Avatar name={profile.displayName} size="sm" />
            </button>
          )}
        >
          {(close) => (
            <div>
              <div className="border-b border-line px-2.5 pb-3 pt-1.5">
                <p className="truncate text-sm font-semibold text-ink">{profile.displayName}</p>
                <p className="truncate text-xs text-faint">{profile.email}</p>
              </div>
              <div className="pt-1">
                <DropdownItem
                  icon={<UserRound className="size-4" />}
                  onClick={() => {
                    close()
                    navigate('/app/settings')
                  }}
                >
                  Profile &amp; settings
                </DropdownItem>
                <DropdownItem
                  icon={<SettingsIcon className="size-4" />}
                  onClick={() => {
                    close()
                    navigate('/app/settings')
                  }}
                >
                  Preferences
                </DropdownItem>
                <div className="my-1 h-px bg-line" />
                <Link to="/" onClick={close} className="block">
                  <DropdownItem icon={<ArrowRight className="size-4" />}>
                    Back to website
                  </DropdownItem>
                </Link>
                <DropdownItem
                  icon={<LogOut className="size-4" />}
                  onClick={() => {
                    close()
                    toast.info('No account to sign out of', 'ProseQ AI runs entirely in your browser.')
                  }}
                >
                  Sign out
                </DropdownItem>
              </div>
            </div>
          )}
        </Dropdown>
      </div>
    </header>
  )
}
