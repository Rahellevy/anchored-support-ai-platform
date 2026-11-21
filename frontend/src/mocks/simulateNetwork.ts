/**
 * Everything in src/mocks/ is fake data that stands in for backend endpoints that don't exist yet.
 * The functions in src/api/ read and update these arrays. When an endpoint is ready, replace the
 * body of that api/ function with an httpClient call and delete the mock it used.
 */

/** Small delay so loading states are visible, like a real request. */
export const simulateNetwork = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** ISO timestamp `daysAgo` days before today at hour:minute (local time). Keeps "Today"/"Yesterday" labels true. */
export function at(daysAgo: number, hour: number, minute: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}
