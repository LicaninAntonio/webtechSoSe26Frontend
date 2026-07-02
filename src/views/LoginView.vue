<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { extractErrorMessage } from '../lib/api'

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const router = useRouter()
const { login } = useAuth()

async function handleLogin() {
  errorMessage.value = ''

  if (!username.value.trim() || !password.value) {
    errorMessage.value = 'Bitte Benutzernamen und Passwort angeben.'
    return
  }

  isLoading.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value.trim(),
        password: password.value,
      }),
    })

    if (!response.ok) {
      errorMessage.value = await extractErrorMessage(
        response,
        'Benutzername oder Passwort ist falsch.',
      )
      return
    }

    const data = await response.json()
    login(data.token, data.user)
    router.push('/')
  } catch (err) {
    errorMessage.value = 'Anmeldung fehlgeschlagen. Bitte später erneut versuchen.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-form">
    <h2>Anmelden</h2>

    <form @submit.prevent="handleLogin">
      <input
        v-model="username"
        type="text"
        placeholder="Benutzername"
        autocomplete="username"
        required
      />
      <input
        v-model="password"
        type="password"
        placeholder="Passwort"
        autocomplete="current-password"
        required
      />
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Meldet an...' : 'Anmelden' }}
      </button>
    </form>

    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>

    <p>Noch kein Konto? <RouterLink to="/register">Registrieren</RouterLink></p>
  </div>
</template>

<style scoped>
.auth-form {
  max-width: 320px;
  margin: 3rem auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.auth-form form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
