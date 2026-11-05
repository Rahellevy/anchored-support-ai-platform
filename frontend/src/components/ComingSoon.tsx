import { Card } from './Card'
import { PageHeader } from './PageHeader'

/** Placeholder for a portal page that exists in the navigation but isn't built yet. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <>
      <title>{`${title} · Anchored`}</title>
      <PageHeader title={title} />
      <Card>This page hasn't been built yet.</Card>
    </>
  )
}
