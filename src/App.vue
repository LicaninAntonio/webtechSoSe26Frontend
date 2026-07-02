<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'

const { currentUser, logout } = useAuth()
const router = useRouter()

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/categories">Categories</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>

      <div class="auth-area">
        <template v-if="currentUser">
          <span class="user-info">Angemeldet als <strong>{{ currentUser.name }}</strong></span>
          <button @click="handleLogout">Abmelden</button>
        </template>
        <template v-else>
          <RouterLink to="/login">Anmelden</RouterLink>
          <RouterLink to="/register">Registrieren</RouterLink>
        </template>
      </div>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
}

.wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 2rem;
}

nav {
  display: flex;
  gap: 1rem;
}

nav a {
  padding: 0 0.5rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

.auth-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  font-size: 0.9rem;
}
</style>
