/**
 * Application shell tests: sidebar navigation, overview greeting with the
 * saved profile name, and the document workflow.
 */
import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import OverviewPage from './OverviewPage'
import DocumentsPage from './DocumentsPage'
import AppTemplatesPage from './AppTemplatesPage'
import BrandVoicePage from './BrandVoicePage'
import PlannerPage from './PlannerPage'
import HistoryPage from './HistoryPage'
import SettingsPage from './SettingsPage'
import { __resetBootstrapForTests, bootstrapApplication } from '@/store/bootstrap'
import { db } from '@/services/db'
import { useProfileStore } from '@/store/profile'
import { useDocumentsStore } from '@/store/documents'

function renderAt(path: string, el: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={<AppLayout />}>
          <Route path="*" element={el} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('app shell', () => {
  beforeEach(async () => {
    localStorage.clear()
    useProfileStore.persist.clearStorage()
    __resetBootstrapForTests()
    await db.clearAll()
    await bootstrapApplication()
  })

  it('renders all sidebar navigation items', () => {
    renderAt('/app', <OverviewPage />)
    const nav = screen.getByRole('navigation', { name: 'Application' })
    for (const label of ['Overview', 'AI Writer', 'Documents', 'Templates', 'Brand Voice', 'Content Planner', 'History', 'Settings']) {
      expect(within(nav).getByRole('link', { name: new RegExp(label, 'i') })).toBeInTheDocument()
    }
  })

  it('greets the user with the persisted profile name', () => {
    useProfileStore.getState().updateProfile({ displayName: 'Ayesha Raza', email: 'a@example.com' })
    renderAt('/app', <OverviewPage />)
    expect(screen.getByRole('heading', { name: 'Ayesha Raza', level: 1 })).toBeInTheDocument()
  })

  it('shows the footer attribution and demo disclaimer inside the app', () => {
    renderAt('/app', <OverviewPage />)
    expect(screen.getAllByText(/made with/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/demonstration project/i).length).toBeGreaterThan(0)
  })
})

describe('app pages', () => {
  beforeEach(async () => {
    localStorage.clear()
    useProfileStore.persist.clearStorage()
    __resetBootstrapForTests()
    await db.clearAll()
    await bootstrapApplication()
  })

  it('documents page lists seeded documents and offers actions', () => {
    renderAt('/app/documents', <DocumentsPage />)
    expect(screen.getByText(/documents/i, { selector: 'h1' })).toBeInTheDocument()
    // "New document" exists in both the topbar and the page header
    expect(screen.getAllByRole('button', { name: /new document/i }).length).toBeGreaterThanOrEqual(2)
    // at least one seeded doc card
    expect(screen.getAllByRole('button', { name: /^open /i }).length).toBeGreaterThan(0)
  })

  it('templates page (app) shows the full library', () => {
    renderAt('/app/templates', <AppTemplatesPage />)
    expect(screen.getAllByRole('button', { name: /use template/i }).length).toBeGreaterThanOrEqual(24)
  })

  it('brand voice page shows the seeded voice', () => {
    renderAt('/app/brand-voice', <BrandVoicePage />)
    expect(screen.getByText('Clear & Confident')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new voice/i })).toBeInTheDocument()
  })

  it('planner renders the calendar with statuses legend', () => {
    renderAt('/app/planner', <PlannerPage />)
    expect(screen.getByRole('heading', { name: /content planner/i })).toBeInTheDocument()
    // Statuses appear in the legend (and possibly on entries) — require all three
    for (const status of ['Draft', 'Planned', 'Published']) {
      expect(screen.getAllByText(status).length).toBeGreaterThan(0)
    }
    expect(screen.getByText(/locally only/i)).toBeInTheDocument()
  })

  it('history page shows document picker with versions', () => {
    renderAt('/app/history', <HistoryPage />)
    expect(screen.getByRole('heading', { name: /version history/i })).toBeInTheDocument()
    expect(screen.getAllByText(/versions/i).length).toBeGreaterThan(0)
  })

  it('settings shows the editable profile with persisted values', () => {
    useProfileStore.getState().updateProfile({ displayName: 'Edited Name', email: 'edited@example.com' })
    renderAt('/app/settings', <SettingsPage />)
    expect((screen.getByLabelText(/display name/i) as HTMLInputElement).value).toBe('Edited Name')
    expect((screen.getByLabelText(/email address/i) as HTMLInputElement).value).toBe('edited@example.com')
  })

  it('creating a document from the store appears in the documents page', () => {
    useDocumentsStore.getState().createDocument({ title: 'A brand new doc' })
    renderAt('/app/documents', <DocumentsPage />)
    expect(screen.getByText('A brand new doc')).toBeInTheDocument()
  })
})
