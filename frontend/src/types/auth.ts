/** Role names exactly as the backend sends them (see backend Models/AppUser.cs → Roles). */
export type Role = 'Admin' | 'Therapist' | 'Patient'

/** The signed-in user, as returned by POST /api/auth/login and GET /api/auth/me. */
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: Role[]
}

/** Body of POST /api/auth/login. */
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}
