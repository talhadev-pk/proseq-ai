import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
import { afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'

beforeAll(() => {
  // jsdom lacks matchMedia; components depend on it for theme + reduced motion.
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }),
    })
  }
  // jsdom lacks ResizeObserver (recharts).
  class RO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, 'ResizeObserver', { writable: true, value: RO })
  Object.defineProperty(globalThis, 'ResizeObserver', { writable: true, value: RO })
  // jsdom lacks IntersectionObserver (framer-motion whileInView).
  class IO {
    root = null
    rootMargin = ''
    thresholds: number[] = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }
  Object.defineProperty(window, 'IntersectionObserver', { writable: true, value: IO })
  Object.defineProperty(globalThis, 'IntersectionObserver', { writable: true, value: IO })
  // jsdom's scrollTo prints "not implemented" noise.
  window.scrollTo = () => undefined
  window.HTMLElement.prototype.scrollIntoView = () => undefined
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})
