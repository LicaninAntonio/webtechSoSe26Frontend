<script setup lang="ts">
const expensesCategory = [
  { id: 1, description: 'Lebensmittel' },
  { id: 2, description: 'Miete' },
  { id: 3, description: 'Hobbies' },
  { id: 4, description: 'Haushalt' },
  { id: 5, description: 'Ausgehen' },
]
</script>

<template>
  <div>
    <h2>Kategorien für Ausgaben</h2>
    <ul>
      <li v-for="category in expensesCategory" :key="category.id">
        {{ category.description }}
      </li>
    </ul>
  </div>
</template>




