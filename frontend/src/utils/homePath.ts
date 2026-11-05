import type { Role, User } from '../types/auth'

/** Where each role lands after signing in. Add new portals here. */
const HOME_BY_ROLE: Record<Role, string> = {
    Admin: '/admin',
    Therapist: '/therapist',
    Patient: '/patient',
}

/** If a user has several roles, the first match in this list wins. */
const ROLE_PRIORITY: Role[] = ['Admin', 'Therapist', 'Patient']

/** The user's home page, or null if they have no role with a portal yet. */
export function homePathFor(user: User): string | null {
    const role = ROLE_PRIORITY.find((r) => user.roles.includes(r))
    return role ? HOME_BY_ROLE[role] : null
}
