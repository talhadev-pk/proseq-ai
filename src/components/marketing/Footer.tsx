import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'

const productLinks = [
  { to: '/features', label: 'Features' },
  { to: '/templates', label: 'Templates' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/app', label: 'Open the app' },
]

const companyLinks = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

/** Shared footer — attribution + demonstration disclaimer are mandatory. */
export function Footer() {
  return (
    <footer className="border-t border-line bg-sand/50">
      <div className="container-site py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              A calm, focused writing workspace with AI-assisted editing tools, templates, brand
              voice, and content planning — built as a frontend demonstration.
            </p>
          </div>
          <nav aria-label="Product">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">Product</h3>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Company">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">Company</h3>
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
            Made with <Heart className="size-4 fill-clay text-clay" aria-label="love" /> by Talha
          </p>
          <p className="max-w-xl text-xs leading-relaxed text-faint">
            This is a demonstration project. AI-generated examples and displayed data may be
            simulated or illustrative.
          </p>
        </div>
      </div>
    </footer>
  )
}
