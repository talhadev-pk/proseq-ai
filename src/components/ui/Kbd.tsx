export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-line bg-paper px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted shadow-soft">
      {children}
    </kbd>
  )
}
