import { useEffect } from 'react'

interface SEOOptions {
  title: string
  description?: string
}

const SITE_NAME = 'ProseQ AI'

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Per-page document title + meta description for the marketing pages. */
export function useSEO({ title, description }: SEOOptions): void {
  useEffect(() => {
    document.title = `${title} — ${SITE_NAME}`
    if (description) {
      setMeta('name', 'description', description)
      setMeta('property', 'og:title', `${title} — ${SITE_NAME}`)
      setMeta('property', 'og:description', description)
    }
    return () => {
      document.title = `${SITE_NAME} — The writing workspace that thinks with you`
    }
  }, [title, description])
}
