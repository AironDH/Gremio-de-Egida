<template>
  <div class="character-section">
    <div class="form-grid">
      <div class="form-group full-width">
        <label for="nombre">Nombre del Personaje</label>
        <input 
          id="nombre" 
          type="text" 
          v-model="datos.nombre" 
          placeholder="Ej. Gandalf" 
          required 
        />
      </div>

      <div class="form-group full-width class-container">
        <div class="class-header">
          <label>Clases y Niveles</label>
          <div class="badges-group">
            <span class="total-level">Nivel Total: {{ nivelTotal }}</span>
          </div>
        </div>
        
        <div v-for="(claseItem, index) in datos.clases" :key="index" class="class-row">
          <select v-model="claseItem.nombre" required>
            <option disabled value="">Selecciona una clase</option>
            <option v-for="c in listadoClases" :key="c.nombre" :value="c.nombre">
              {{ c.nombre }}
            </option>
          </select>

          <input 
            type="number" 
            v-model.number="claseItem.nivel" 
            min="1" 
            max="20" 
            title="Nivel"
            required 
          />

          <select v-model="claseItem.subclase">
            <option value="">Sin subclase</option>
            <option 
              v-for="sub in obtenerSubclases(claseItem.nombre)" 
              :key="sub.nombre" 
              :value="sub.nombre">
              {{ sub.nombre }}
            </option>
          </select>

          <BaseButton 
            v-if="datos.clases.length > 1" 
            variant="danger" 
            type="button" 
            @click="eliminarClase(index)"
          >
            X
          </BaseButton>
        </div>
        
        <BaseButton variant="secondary" type="button" @click="agregarClase">
          + Añadir Clase
        </BaseButton>
      </div>

      <div class="form-group">
        <label for="especie">Especie</label>
        <select id="especie" v-model="datos.especie" @change="alCambiarEspecie" required>
          <option disabled value="">Selecciona una especie</option>
          <option v-for="esp in listadoEspecies" :key="esp.nombre" :value="esp.nombre">
            {{ esp.nombre }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="razasDisponibles.length > 0">
        <label for="raza">Linaje / Raza</label>
        <select id="raza" v-model="datos.raza" required>
          <option disabled value="">Selecciona un linaje</option>
          <option v-for="raza in razasDisponibles" :key="raza.nombre" :value="raza.nombre">
            {{ raza.nombre }}
          </option>
        </select>
      </div>
    </div>

    <h3 class="section-subtitle">Puntos de Golpe</h3>
    <div class="form-grid">
      <div class="form-group">
        <label for="pgMax">PG Máximos</label>
        <input id="pgMax" type="number" min="1" v-model.number="datos.puntosVidaMax" required />
      </div>
      <div class="form-group">
        <label for="pgActual">PG Actuales</label>
        <input id="pgActual" type="number" min="0" :max="datos.puntosVidaMax" v-model.number="datos.puntosVidaActuales" required />
      </div>
      <div class="form-group">
        <label for="pgTemp">PG Temporales</label>
        <input id="pgTemp" type="number" min="0" v-model.number="datos.pgTemp" placeholder="0" />
      </div>
    </div>

    </div>
</template>

<script setup>
import { computed } from 'vue'
import datosMundo from '../../data/data.json'
import BaseButton from '../common/BaseButton.vue'
import { calcularNivelTotal, calcularPB } from '../../utils/calculations.js'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const datos = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// === Lógica de Clases ===
const listadoClases = computed(() => datosMundo.clases || [])

const obtenerSubclases = (nombreClase) => {
  if (!nombreClase) return []
  const claseEncontrada = listadoClases.value.find(c => c.nombre === nombreClase)
  return claseEncontrada && claseEncontrada.subclases ? claseEncontrada.subclases : []
}

const agregarClase = () => {
  datos.value.clases.push({ nombre: '', nivel: 1, subclase: '' })
}

const eliminarClase = (index) => {
  datos.value.clases.splice(index, 1)
}

// Cálculo del Nivel Total 
const nivelTotal = computed(() => {
  return calcularNivelTotal(datos.value.clases)
})

// Calculamos reactivamente el Bonificador de Competencia
const bonificadorCompetencia = computed(() => {
  return calcularPB(nivelTotal.value)
})

// === Lógica de Especies ===
const listadoEspecies = computed(() => datosMundo.especies || [])

const razasDisponibles = computed(() => {
  if (!datos.value.especie) return []
  const especieSeleccionada = listadoEspecies.value.find(e => e.nombre === datos.value.especie)
  return especieSeleccionada && especieSeleccionada.razas ? especieSeleccionada.razas : []
})

const alCambiarEspecie = () => {
  datos.value.raza = ''
}
</script>

<style scoped>
/* Añade estos estilos específicos para el bloque de clases */
.full-width {
  grid-column: 1 / -1;
}
.class-container {
  background: var(--color-background, #f5f0e8);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.badges-group {
  display: flex;
  gap: 0.5rem;
}
.total-level, .pb-badge {
  font-weight: bold;
  font-size: 0.9rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}
.total-level {
  color: var(--color-primary, #7b1fa2);
  background: white;
  border: 1px solid var(--color-primary-light, #ae52d4);
}
.pb-badge {
  color: white;
  background: var(--color-success, #ae52d4);
  border: 1px solid var(--color-success, #4caf50);
}
.class-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  align-items: center;
}
.class-row select:first-child { flex: 2; }
.class-row input { width: 60px; text-align: center; }
.class-row select:nth-child(3) { flex: 2; }

@media (max-width: 640px) {
  .class-row {
    flex-wrap: wrap;
  }
  .class-row select:first-child, .class-row select:nth-child(3) { flex: 1 1 100%; }
}
.character-section {
  padding: 1rem;
  background: var(--color-surface, #ffffff);
  border-radius: var(--border-radius, 4px);
  margin-bottom: 1rem;
}
.section-subtitle {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-primary, #7b1fa2);
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group label {
  font-weight: bold;
  font-size: 0.9rem;
  color: var(--color-text-secondary, #757575);
}
.form-group input, .form-group select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>