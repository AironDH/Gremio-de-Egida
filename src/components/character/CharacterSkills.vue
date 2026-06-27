<template>
  <div class="character-section">
    <div class="section-header">
      <h3 class="section-title">Habilidades</h3>
      <button 
        type="button" 
        class="btn-gear" 
        :class="{ 'is-active': editandoCompetencias }"
        @click="editandoCompetencias = !editandoCompetencias" 
        title="Modificar competencias"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    </div>

    <div class="skills-grid">
      <div class="skill-item" v-for="(datosCalc, nombre) in habilidadesCalculadas" :key="nombre">
        <select 
          v-if="editandoCompetencias" 
          v-model="habilidades[nombre]" 
          class="skill-select"
        >
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
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  habilidadesCalculadas: { type: Object, required: true }
})

const emit = defineEmits(['update:modelValue'])

// Estado local para alternar la visibilidad de los desplegables
const editandoCompetencias = ref(false)

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

/* Contenedor para alinear título y botón en la misma línea */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.section-title {
  margin: 0; /* Limpiamos márgenes para evitar desalineación */
  color: var(--color-primary, #7b1fa2);
}

/* Botón de Engranaje */
.btn-gear {
  background: transparent;
  border: none;
  color: var(--color-text-secondary, #757575);
  cursor: pointer;
  padding: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: transform 0.3s ease, color 0.2s ease, background-color 0.2s ease;
}

.btn-gear:hover {
  color: var(--color-primary, #7b1fa2);
  background-color: rgba(0, 0, 0, 0.05);
  transform: rotate(30deg);
}

.btn-gear.is-active {
  color: var(--color-primary, #7b1fa2);
  transform: rotate(90deg);
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
}

.skill-item {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 0.5rem;
  background: var(--color-background, #f5f0e8);
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  height: 38px; /* Altura fija para evitar saltos de layout al ocultar/mostrar */
  box-sizing: border-box;
}

.skill-select {
  padding: 0.25rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 100px;
  font-size: 0.85rem;
}

.skill-info {
  flex: 1;
  margin-left: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  overflow: hidden;
}

.skill-name {
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skill-attr {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #757575);
  flex-shrink: 0;
}

.skill-total {
  font-weight: bold;
  font-size: 1.1rem;
  width: 35px;
  text-align: right;
  color: var(--color-primary, #7b1fa2);
  flex-shrink: 0;
}
</style>