const API_URL = import.meta.env.VITE_API_URL

export interface AuthUser {
  id: number
  name: string
  username: string
}

const TOKEN_KEY = 'authToken'
const USER_KEY = 'authUser'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as AuthUser) : null
}

export function storeAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// Wrapper um fetch(), der automatisch die Basis-URL und den Bearer-Token mitschickt.
// Bei einer 401-Antwort (z.B. abgelaufener Token) wird der Nutzer ausgeloggt und zum Login geschickt.
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (response.status === 401) {
    clearAuth()
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  return response
}

// Liest bei einer Fehlerantwort die vom Backend gesendete Fehlermeldung aus ({ message: "..." })
export async function extractErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json()
    return data?.message ?? fallback
  } catch {
    return fallback
  }
}
