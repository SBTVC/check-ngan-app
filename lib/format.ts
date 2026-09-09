export function formatDateTime(value: string | null | undefined) {
  if (!value) return 'ไม่กำหนด'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function percent(score: number, maxScore: number) {
  if (!maxScore) return 0
  return Math.max(0, Math.min(100, Math.round((score / maxScore) * 100)))
}
