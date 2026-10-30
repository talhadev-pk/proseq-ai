import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Compass } from 'lucide-react'
import { useSEO } from '@/lib/seo'
import { Button } from '@/components/ui/Button'
import { LogoMark } from '@/components/brand/Logo'

export default function NotFoundPage() {
  useSEO({ title: 'Page not found', description: 'The page you were looking for does not exist.' })
  return (
    <section className="relative flex min-h-[72vh] items-center justify-center overflow-hidden px-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(40% 40% at 30% 20%, var(--c-violet-soft), transparent 70%), radial-gradient(35% 35% at 75% 80%, var(--c-blue-soft), transparent 70%)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <LogoMark className="mx-auto size-14 opacity-70" />
        <p className="mt-6 font-display text-7xl font-semibold tracking-tight text-gradient-brand sm:text-8xl">
          404
        </p>
        <h1 className="mt-3 font-display text-2xl font-semibold">This page went for a walk</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          The link may be mistyped, or the page may have been moved. Either way, the writing
          workspace is exactly where you left it.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <Link to="/">
            <Button icon={<ArrowLeft className="size-4" />}>Back to home</Button>
          </Link>
          <Link to="/app">
            <Button variant="outline" icon={<Compass className="size-4" />}>
              Open the workspace
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
