/**
 * Mock mode (VITE_MOCK_AUTH=true in .env.development.local): every function in src/api/ returns
 * fake data from src/mocks/ instead of calling the backend, so the whole frontend runs on its own.
 * Sign in with any email/password; emails starting with "admin" or "patient" get that role,
 * anything else signs in as a Therapist.
 *
 * Each api/ function has both branches: `if (USE_MOCKS) { ...mock... }` and the real httpClient call.
 */
export const USE_MOCKS = import.meta.env.VITE_MOCK_AUTH === 'true'
