import Link from 'next/link'
import type { ReactNode } from 'react'

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div>{eyebrow ? <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">{eyebrow}</p> : null}<h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>{description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}</div>{actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}</section>
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) { return <Link href={href} className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-orange-600">{children}</Link> }
export function SecondaryLink({ href, children }: { href: string; children: ReactNode }) { return <Link href={href} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">{children}</Link> }

export function StatCard({ label, value, note, tone = 'neutral' }: { label: string; value: string | number; note?: string; tone?: 'neutral' | 'orange' | 'green' | 'blue' }) {
  const toneClass = { neutral: 'border-slate-200 bg-white', orange: 'border-orange-200 bg-orange-50', green: 'border-emerald-200 bg-emerald-50', blue: 'border-blue-200 bg-blue-50' }[tone]
  return <div className={`rounded-2xl border p-5 shadow-sm ${toneClass}`}><p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</p><p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>{note ? <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p> : null}</div>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-orange-500 shadow-sm">▤</div><h3 className="mt-4 text-base font-extrabold">{title}</h3><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>{action ? <div className="mt-5">{action}</div> : null}</div> }

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'orange' | 'green' | 'blue' | 'red' }) { const toneClass = { neutral: 'bg-slate-100 text-slate-600', orange: 'bg-orange-100 text-orange-700', green: 'bg-emerald-100 text-emerald-700', blue: 'bg-blue-100 text-blue-700', red: 'bg-rose-100 text-rose-700' }[tone]; return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${toneClass}`}>{children}</span> }
