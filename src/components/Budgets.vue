<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface BudgetDTO {
  id: number
  budgetName: string
  budgetAmount: number
}

const budgets = ref<BudgetDTO[]>([])

// Formular: neues Budget anlegen (nur Name, kein Limit mehr)
const newBudgetName = ref('')
const isSavingBudget = ref(false)
const budgetErrorMessage = ref('')

// Formular: Ausgabe zu einem Budget hinzufügen
// Pro Budget merken wir uns Betrag + Datum getrennt, key = budget.id
const expenseAmounts = ref<Record<number, number | null>>({})
const expenseDates = ref<Record<number, string>>({})
const savingExpenseForBudgetId = ref<number | null>(null)
const expenseErrorMessage = ref('')

async function loadBudgets() {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/budgets`)
  budgets.value = await response.json()
}

onMounted(loadBudgets)

async function addBudget() {
  budgetErrorMessage.value = ''

  if (!newBudgetName.value.trim()) {
    budgetErrorMessage.value = 'Bitte einen Namen für das Budget angeben.'
    return
  }

  isSavingBudget.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budgetName: newBudgetName.value,
      }),
    })

    if (!response.ok) {
      throw new Error(`Server antwortete mit Status ${response.status}`)
    }

    newBudgetName.value = ''
    await loadBudgets()
  } catch (err) {
    budgetErrorMessage.value = 'Budget konnte nicht angelegt werden.'
    console.error(err)
  } finally {
    isSavingBudget.value = false
  }
}

async function addExpense(budgetId: number) {
  expenseErrorMessage.value = ''

  const amount = expenseAmounts.value[budgetId]
  const date = expenseDates.value[budgetId]

  if (amount === null || amount === undefined || !date) {
    expenseErrorMessage.value = 'Bitte Betrag und Datum für die Ausgabe angeben.'
    return
  }

  savingExpenseForBudgetId.value = budgetId
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/v1/budgets/${budgetId}/expenses`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          date: date,
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Server antwortete mit Status ${response.status}`)
    }

    // Formularfelder für dieses Budget zurücksetzen
    expenseAmounts.value[budgetId] = null
    expenseDates.value[budgetId] = ''

    // Liste neu laden, damit der aktualisierte budgetAmount sichtbar wird
    await loadBudgets()
  } catch (err) {
    expenseErrorMessage.value = 'Ausgabe konnte nicht gespeichert werden.'
    console.error(err)
  } finally {
    savingExpenseForBudgetId.value = null
  }
}
</script>

<template>
  <div>
    <h2>Budgets</h2>

    <ul>
      <li v-for="budget in budgets" :key="budget.id">
        <strong>{{ budget.budgetName }}</strong>: {{ budget.budgetAmount }}€ ausgegeben

        <form @submit.prevent="addExpense(budget.id)" style="margin-top: 0.5rem">
          <input
            v-model.number="expenseAmounts[budget.id]"
            type="number"
            placeholder="Betrag in €"
            min="0"
            required
          />
          <input v-model="expenseDates[budget.id]" type="date" required />
          <button type="submit" :disabled="savingExpenseForBudgetId === budget.id">
            {{ savingExpenseForBudgetId === budget.id ? 'Speichert...' : 'Ausgabe hinzufügen' }}
          </button>
        </form>
      </li>
    </ul>

    <p v-if="expenseErrorMessage" style="color: red">{{ expenseErrorMessage }}</p>

    <h3>Neues Budget anlegen</h3>
    <form @submit.prevent="addBudget">
      <input v-model="newBudgetName" type="text" placeholder="Budgetname" required />
      <button type="submit" :disabled="isSavingBudget">
        {{ isSavingBudget ? 'Speichert...' : 'Budget hinzufügen' }}
      </button>
    </form>

    <p v-if="budgetErrorMessage" style="color: red">{{ budgetErrorMessage }}</p>
  </div>
</template>
