<template>
  <div class="character-section">
    <h3 class="section-title">Características y Salvaciones</h3>
    <div class="stats-grid">
      <div class="stat-box" v-for="(valor, nombre) in caracteristicas" :key="nombre">
        <label :for="'stat-' + nombre" class="stat-label">{{ capitalizar(nombre) }}</label>
        <input 
          :id="'stat-' + nombre" 
          type="number" 
          min="1" 
          max="30" 
          v-model.number="caracteristicas[nombre]" 
        />
        <div class="stat-mod">Mod: {{ formatearModificador(calcularModificador(valor)) }}</div>
        
        <div class="saving-throw">
          <label>
            <input type="checkbox" v-model="salvaciones[nombre]" />
            Salvación: <strong>{{ formatearModificador(salvacionesCalculadas[nombre]) }}</strong>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { calcularModificador } from '../../utils/calculations.js'

const props = defineProps({
  caracteristicas: { type: Object, required: true },
  salvaciones: { type: Object, required: true },
  salvacionesCalculadas: { type: Object, required: true }
})

const emit = defineEmits(['update:caracteristicas', 'update:salvaciones'])

const caracteristicas = computed({
  get: () => props.caracteristicas,
  set: (value) => emit('update:caracteristicas', value)
})

const salvaciones = computed({
  get: () => props.salvaciones,
  set: (value) => emit('update:salvaciones', value)
})

const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1)

const formatearModificador = (valor) => {
  return valor >= 0 ? `+${valor}` : `${valor}`
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
  padding: 0.5rem;
  background: var(--color-background, #f5f0e8);
  border-radius: 10px;
  border: 1px solid #e0e0e0;
}
.stat-label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--color-text, #212121);
}
.stat-box input[type="number"] {
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
.saving-throw {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>