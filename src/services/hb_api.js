import axios from 'axios'

export const TOKEN_KEY = 'hb_token'
export const USER_KEY = 'hb_user'

// 🔥 FIX: conexión obligatoria a backend en producción
const baseURL =
  import.meta.env.VITE_BASE_URL

const hbApi = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

// --- Request: token ---
hbApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// --- Response: 401 handler ---
hbApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (status === 401) {
      const enLogin = window.location.pathname.startsWith('/login')

      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)

      if (!enLogin) {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  }
)

export default hbApi
