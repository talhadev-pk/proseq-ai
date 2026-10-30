/** Smoke tests: every marketing page renders its key content. */
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import HomePage from './HomePage'
import FeaturesPage from './FeaturesPage'
import TemplatesPage from './TemplatesPage'
import PricingPage from './PricingPage'
import AboutPage from './AboutPage'
import ContactPage from './ContactPage'
import NotFoundPage from './NotFoundPage'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { TEMPLATES } from '@/data/templates'

function withRouter(el: React.ReactElement) {
  return <MemoryRouter initialEntries={['/']}>{el}</MemoryRouter>
}

describe('marketing pages render', () => {
  it('home shows the hero headline and CTAs', () => {
    render(withRouter(<HomePage />))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/writing workspace that/i)
    expect(screen.getAllByRole('link', { name: /start writing/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /explore features/i }).length).toBeGreaterThan(0)
  })

  it('marketing layout renders the footer attribution and disclaimer', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<div>page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getAllByText(/made with/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/demonstration project/i)).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('features lists the nine feature groups', () => {
    render(withRouter(<FeaturesPage />))
    for (const title of ['AI writing assistance', 'Grammar improvement', 'Tone adjustment', 'Summarization', 'Brand voice', 'Content planning']) {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    }
  })

  it('templates page filters by category and previews', async () => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    render(withRouter(<TemplatesPage />))
    expect(screen.getByText(new RegExp(`${TEMPLATES.length} templates`, 'i'))).toBeInTheDocument()
    const marketingBtn = screen.getByRole('button', { name: /^Marketing · \d+$/ })
    await user.click(marketingBtn)
    // Only marketing templates remain after the filter
    expect(screen.getAllByRole('button', { name: /use template/i }).length).toBe(
      TEMPLATES.filter((t) => t.category === 'marketing').length,
    )
  })

  it('pricing shows demonstration labels and all tiers', () => {
    render(withRouter(<PricingPage />))
    expect(screen.getByRole('heading', { name: /free/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /pro/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /team/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/illustrative demonstration content/i)).toBeInTheDocument()
  })

  it('about explains the vision without inventing history', () => {
    render(withRouter(<AboutPage />))
    expect(screen.getByRole('heading', { name: /the vision/i })).toBeInTheDocument()
    expect(screen.getByText(/does not have real users/i)).toBeInTheDocument()
  })

  it('contact renders a validated demo form', () => {
    render(withRouter(<ContactPage />))
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByText(/demonstration-only/i)).toBeInTheDocument()
  })

  it('404 page renders', () => {
    render(withRouter(<NotFoundPage />))
    expect(screen.getByText(/404/)).toBeInTheDocument()
  })
})
