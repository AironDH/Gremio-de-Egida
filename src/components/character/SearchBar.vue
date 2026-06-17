<template>
  <div class="search-bar">
    <input 
      type="text" 
      :value="modelValue" 
      @input="$emit('update:modelValue', $event.target.value)"
      placeholder="Buscar personaje por nombre..."
      class="search-bar__input"
    />
    <select 
      :value="claseFiltro" 
      @change="$emit('update:claseFiltro', $event.target.value)"
      class="search-bar__select"
    >
      <option value="">Todas las clases</option>
      <option v-for="clase in clases" :key="clase" :value="clase">
        {{ clase }}
      </option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  claseFiltro: {
    type: String,
    default: ''
  },
  clases: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update:modelValue', 'update:claseFiltro'])
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}
.search-bar__input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border, #ccc);
  border-radius: var(--border-radius, 4px);
  font-size: 1rem;
}
.search-bar__input:focus, .search-bar__select:focus {
  outline: 2px solid var(--color-primary, #7b1fa2);
}
.search-bar__select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border, #ccc);
  border-radius: var(--border-radius, 4px);
  background: white;
  font-size: 1rem;
  cursor: pointer;
}
@media (max-width: 600px) {
  .search-bar {
    flex-direction: column;
  }
}
</style>