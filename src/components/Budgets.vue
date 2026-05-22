<script setup lang="ts">
import { ref, onMounted } from 'vue'

const budgets = ref<{budgetName: string, budgetLimit: number}[]>([])

onMounted(async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/budgets`)
  budgets.value = await response.json()
})
</script>

<template>
  <div>
    <h2>Budgets</h2>
    <ul>
      <li v-for="budget in budgets" :key="budget.budgetName">
        {{ budget.budgetName }}: {{ budget.budgetLimit }}€
      </li>
    </ul>
  </div>
</template>
