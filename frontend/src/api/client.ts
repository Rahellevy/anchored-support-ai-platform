import axios from 'axios'

/**
 * The one axios instance every API call uses.
 *
 * - baseURL "/api" is relative on purpose: the Vite proxy (dev) and nginx (Docker) both
 *   forward /api to the backend, so no environment variable is needed.
 * - The auth cookie is sent automatically (same origin).
 * - Non-2xx responses throw an AxiosError; check error.response?.status in callers.
 */
export const httpClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15_000, // milliseconds (15 seconds)
})

httpClient.interceptors.response.use(
  (response) => {
    // A request that misses the API gets the React app's index.html back. Fail loudly instead.
    if (typeof response.data === 'string' && response.data.trimStart().toLowerCase().startsWith('<!doctype')) {
      return Promise.reject(new Error(`Expected JSON from ${response.config.url} but got HTML. Check the /api path.`))
    }
    return response
  },
  (error) => {
    // 401 is expected from GET /auth/me when nobody is signed in, so it isn't logged.
    const status = error.response?.status
    if (status && status !== 401) {
      console.error(`API ${status}: ${error.config?.method?.toUpperCase()} ${error.config?.url}`)
    }
    return Promise.reject(error)
  },
)
