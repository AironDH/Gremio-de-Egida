<template>
  <div class="character-section">
    <h3 class="section-title">Habilidades</h3>
    <div class="skills-grid">
      <div class="skill-item" v-for="(datosCalc, nombre) in habilidadesCalculadas" :key="nombre">
        <select v-model="habilidades[nombre]" class="skill-select">
          <option value="sin_competencia">No competente</option>
          <option value="competencia">Competencia</option>
          <option value="pericia">Pericia</option>
          <option value="media_competencia">Media competencia</option>
        </select>
        
        <div class="skill-info">
          <span class="skill-name">{{ formatearNombre(nombre) }}</span>
          <span class="skill-attr">({{ datosCalc.caracteristicaBase.substring(0,3).toUpperCase() }})</span>
        </div>
        
        <div class="skill-total">
          {{ formatearModificador(datosCalc.modificadorTotal) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  habilidadesCalculadas: { type: Object, required: true }
})

const emit = defineEmits(['update:modelValue'])

const habilidades = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formatearNombre = (str) => {
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

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
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75rem;
}
.skill-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: var(--color-background, #f5f0e8);
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}
.skill-select {
  padding: 0.25rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 130px;
}
.skill-info {
  flex: 1;
  margin-left: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.skill-name {
  font-weight: 500;
  font-size: 0.9rem;
}
.skill-attr {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #757575);
}
.skill-total {
  font-weight: bold;
  font-size: 1.1rem;
  width: 35px;
  text-align: right;
  color: var(--color-primary, #7b1fa2);
}
</style>