<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface MonthlyLimitDTO {
  id: number | null
  month: string // Format "YYYY-MM"
  limitAmount: number
  availableAmount: number
}

// aktueller Monat im Format "YYYY-MM", z.B. "2026-06"
const currentMonth = new Date().toISOString().slice(0, 7)

const monthlyLimit = ref<MonthlyLimitDTO | null>(null)
const limitInput = ref<number | null>(null)
const isSaving = ref(false)
const errorMessage = ref('')

// Hübscher Monatsname für die Anzeige, z.B. "Juni"
const monthLabel = computed(() => {
  const [year, month] = currentMonth.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('de-DE', { month: 'long' })
})

async function loadMonthlyLimit() {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/v1/monthly-limits/${currentMonth}`,
  )
  monthlyLimit.value = await response.json()
  limitInput.value = monthlyLimit.value?.limitAmount ?? null
}

onMounted(loadMonthlyLimit)

async function saveLimit() {
  errorMessage.value = ''

  if (limitInput.value === null) {
    errorMessage.value = 'Bitte ein Limit angeben.'
    return
  }

  isSaving.value = true
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/v1/monthly-limits/${currentMonth}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: currentMonth,
          limitAmount: limitInput.value,
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Server antwortete mit Status ${response.status}`)
    }

    await loadMonthlyLimit()
  } catch (err) {
    errorMessage.value = 'Limit konnte nicht gespeichert werden.'
    console.error(err)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div>
    <h2>Monatslimit</h2>

    <p v-if="monthlyLimit && monthlyLimit.id !== null">
      Gesetztes Budget {{ monthLabel }}: {{ monthlyLimit.limitAmount }}€<br />
      Noch verfügbares Budget {{ monthLabel }}: {{ monthlyLimit.availableAmount }}€
    </p>
    <p v-else>Für {{ monthLabel }} wurde noch kein Limit gesetzt.</p>

    <form @submit.prevent="saveLimit">
      <input
        v-model.number="limitInput"
        type="number"
        placeholder="Limit in €"
        min="0"
        required
      />
      <button type="submit" :disabled="isSaving">
        {{ isSaving ? 'Speichert...' : 'Limit setzen / anpassen' }}
      </button>
    </form>

    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
  </div>
</template>
