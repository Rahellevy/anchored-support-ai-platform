/**
 * Mock mode (VITE_MOCK_AUTH=true in .env.development.local): auth, disclosures and patient chat use
 * fake data instead of the backend, so the frontend can run on its own.
 *
 * The therapist/admin pages (patients, alerts, users, rules) always use mocks for now, because those
 * endpoints don't exist yet; see the TODO(backend) comments in their api/ files.
 */
export const USE_MOCKS = import.meta.env.VITE_MOCK_AUTH === 'true'
