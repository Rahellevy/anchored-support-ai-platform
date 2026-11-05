import { PortalLayout } from '../components/PortalLayout'

/** Frame for every /admin page. Pages render inside. */
export function AdminLayout() {
  return (
    <PortalLayout
      bannerMessage="Synthetic data only. Proof of concept."
      header={{
        subtitle: 'Administration',
        compact: true,
        links: [
          { to: '/admin/users', label: 'Users' },
          { to: '/admin/knowledge-base', label: 'Knowledge base', alsoActiveFor: ['/admin/knowledge-base/'] },
          { to: '/admin/rules', label: 'Red-flag rules' },
          { to: '/admin/monitoring', label: 'Monitoring' },
        ],
      }}
    />
  )
}
