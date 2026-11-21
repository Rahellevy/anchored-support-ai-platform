/** pluralize(1, 'conversation') → "1 conversation", pluralize(4, 'conversation') → "4 conversations" */
export function pluralize(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

/** initials('Jordan Avery') → "JA" */
export function initials(name: string): string {
  return name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase())
      .slice(0, 2)
      .join('')
}

/** "9:14 AM" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

/** "Today", "Yesterday", "Mon" (within a week) or "Oct 1". */
export function formatDay(iso: string, now = new Date()): string {
  const date = new Date(iso)
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000)

  if (daysAgo === 0) return 'Today'
  if (daysAgo === 1) return 'Yesterday'
  if (daysAgo > 1 && daysAgo < 7) return date.toLocaleDateString('en-US', { weekday: 'short' })
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** "Today, 9:14 AM" */
export function formatDayTime(iso: string): string {
  return `${formatDay(iso)}, ${formatTime(iso)}`
}

/** "Today, 9:02–9:17 AM" (drops the first AM/PM when both times share it). */
export function formatTimeRange(startIso: string, endIso: string): string {
  let start = formatTime(startIso)
  const end = formatTime(endIso)
  if (start.slice(-2) === end.slice(-2)) start = start.slice(0, -3)
  return `${formatDay(startIso)}, ${start}–${end}`
}
