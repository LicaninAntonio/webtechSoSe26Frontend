<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { extractErrorMessage } from '../lib/api'

const name = ref('')
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const router = useRouter()
const { login } = useAuth()

async function handleRegister() {
  errorMessage.value = ''

  if (!name.value.trim() || !username.value.trim() || !password.value) {
    errorMessage.value = 'Bitte Name, Benutzername und Passwort angeben.'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Das Passwort muss mindestens 6 Zeichen lang sein.'
    return
  }

  isLoading.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value.trim(),
        username: username.value.trim(),
        password: password.value,
      }),
    })

    if (!response.ok) {
      errorMessage.value = await extractErrorMessage(
        response,
        'Registrierung fehlgeschlagen.',
      )
      return
    }

    // Nach erfolgreicher Registrierung ist der Nutzer direkt angemeldet (Token kommt vom Backend zurück)
    const data = await response.json()
    login(data.token, data.user)
    router.push('/')
  } catch (err) {
    errorMessage.value = 'Registrierung fehlgeschlagen. Bitte später erneut versuchen.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-form">
    <h2>Registrieren</h2>

    <form @submit.prevent="handleRegister">
      <input v-model="name" type="text" placeholder="Name" autocomplete="name" required />
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
        placeholder="Passwort (mind. 6 Zeichen)"
        autocomplete="new-password"
        required
      />
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Registriert...' : 'Registrieren' }}
      </button>
    </form>

    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>

    <p>Schon ein Konto? <RouterLink to="/login">Anmelden</RouterLink></p>
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
