import { isAxiosError } from 'axios'
import type { LoginRequest, Role, User } from '../types/auth'
import { httpClient } from './client'
import { USE_MOCKS as MOCK_AUTH } from './mockMode'

/**
 * Calls to the backend's /api/auth endpoints.
 *
 * Mock mode: set VITE_MOCK_AUTH=true in .env.development.local to sign in without a backend.
 * Any email/password works; emails starting with "admin" or "patient" get that role,
 * everything else signs in as a Therapist. Never enable this outside local development.
 */
const MOCK_KEY = 'mockSignedInEmail'

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
}

export const login = async (loginRequest: LoginRequest): Promise<User> => {
  if (MOCK_AUTH) {
    sessionStorage.setItem(MOCK_KEY, loginRequest.email)
    return mockUser(loginRequest.email)
  }

  const { data } = await httpClient.post<User>(AUTH_ENDPOINTS.LOGIN, loginRequest)
  return data
}

export const logout = async (): Promise<void> => {
  if (MOCK_AUTH) {
    sessionStorage.removeItem(MOCK_KEY)
    return
  }

  await httpClient.post(AUTH_ENDPOINTS.LOGOUT) // 204 No Content
}

/** Who is signed in right now (from the auth cookie), or null if nobody. */
export const getCurrentUser = async (): Promise<User | null> => {
  if (MOCK_AUTH) {
    const email = sessionStorage.getItem(MOCK_KEY)
    return email ? mockUser(email) : null
  }

  try {
    const { data } = await httpClient.get<User>(AUTH_ENDPOINTS.ME)
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) return null // not signed in
    throw error
  }
}

const mockUser = (email: string): User => {
  const lower = email.toLowerCase()
  const role: Role = lower.startsWith('admin') ? 'Admin' : lower.startsWith('patient') ? 'Patient' : 'Therapist'
  const names: Record<Role, [string, string]> = {
    Admin: ['Riley', 'Chen'],
    Therapist: ['Dr. Morgan', 'Hale'],
    Patient: ['Jordan', 'Avery'],
  }
  const [firstName, lastName] = names[role]
  return { id: `mock-${role.toLowerCase()}`, email, firstName, lastName, roles: [role] }
}
