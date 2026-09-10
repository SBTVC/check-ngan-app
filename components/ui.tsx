import Link from 'next/link'
import type { ReactNode } from 'react'

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <section className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end">
      <div className="min-w-0">
        {eyebrow ? <p className="text-xs font-bold tracking-[0.08em] text-orange-600">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </section>
  )
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 ? <span aria-hidden="true" className="text-slate-300">/</span> : null}
          {item.href ? <Link href={item.href} className="font-semibold transition hover:text-orange-600">{item.label}</Link> : <span className="font-semibold text-slate-700">{item.label}</span>}
        </span>
      ))}
    </nav>
  )
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">{children}</Link>
}

export function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">{children}</Link>
}

export function StatCard({ label, value, note, tone = 'neutral' }: { label: string; value: string | number; note?: string; tone?: 'neutral' | 'orange' | 'green' | 'blue' }) {
  const marker = { neutral: 'bg-slate-400', orange: 'bg-orange-500', green: 'bg-emerald-500', blue: 'bg-blue-500' }[tone]
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${marker}`} /><p className="text-sm font-bold text-slate-600">{label}</p></div>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
      {note ? <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p> : null}
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-black text-orange-600">✓</div>
      <h3 className="mt-4 text-base font-black text-slate-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'orange' | 'green' | 'blue' | 'red' }) {
  const toneClass = {
    neutral: 'border-slate-200 bg-slate-50 text-slate-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    red: 'border-rose-200 bg-rose-50 text-rose-700',
  }[tone]
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${toneClass}`}>{children}</span>
}

export function SectionCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>
}
