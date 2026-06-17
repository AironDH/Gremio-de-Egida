<template>
  <div class="character-section">
    <h3 class="section-title">Características</h3>
    <div class="stats-grid">
      <div class="stat-box" v-for="(valor, nombre) in caracteristicas" :key="nombre">
        <label :for="'stat-' + nombre">{{ capitalizar(nombre) }}</label>
        <input 
          :id="'stat-' + nombre" 
          type="number" 
          min="1" 
          max="30" 
          v-model.number="caracteristicas[nombre]" 
        />
        <div class="stat-mod">
          Mod: {{ calcularModificador(caracteristicas[nombre]) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const caracteristicas = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1)

// Función pura extraída de la especificación técnica para calcular el modificador
const calcularModificador = (valor) => {
  if (!valor) return '+0'
  const mod = Math.floor((valor - 10) / 2)
  return mod >= 0 ? `+${mod}` : `${mod}`
}
</script>

<style scoped>
.character-section {
  padding: 1.5rem;
  background: var(--color-surface, #ffffff);
  border-radius: var(--border-radius, 4px);
  margin-bottom: 1rem;
}
.section-title {
  margin-top: 0;
  color: var(--color-primary, #7b1fa2);
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}
.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--color-background, #f5f0e8);
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.stat-box label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--color-text, #212121);
}
.stat-box input {
  width: 60px;
  text-align: center;
  font-size: 1.2rem;
  padding: 0.25rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.stat-mod {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary, #757575);
}
</style>