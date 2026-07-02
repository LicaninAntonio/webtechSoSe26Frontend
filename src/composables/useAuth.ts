import { ref } from 'vue'
import type { AuthUser } from '../lib/api'
import { getStoredUser, storeAuth, clearAuth } from '../lib/api'

// Modul-weiter State, damit alle Komponenten denselben angemeldeten Nutzer sehen
const currentUser = ref<AuthUser | null>(getStoredUser())

export function useAuth() {
  function login(token: string, user: AuthUser) {
    storeAuth(token, user)
    currentUser.value = user
  }

  function logout() {
    clearAuth()
    currentUser.value = null
  }

  return {
    currentUser,
    login,
    logout,
    isAuthenticated: () => currentUser.value !== null,
  }
}
