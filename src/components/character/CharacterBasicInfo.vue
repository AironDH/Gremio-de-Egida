<template>
  <div class="character-section">
    <div class="form-grid">
      <div class="form-group">
        <label for="nombre">Nombre del Personaje</label>
        <input 
          id="nombre" 
          type="text" 
          v-model="datos.nombre" 
          placeholder="Ej. Gandalf" 
          required 
        />
      </div>
      
      <div class="form-group">
        <label for="clase">Clase Principal</label>
        <select id="clase" v-model="datos.clase" required>
          <option disabled value="">Selecciona una clase</option>
          <option v-for="clase in clasesDisponibles" :key="clase" :value="clase">
            {{ clase }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="especie">Especie</label>
        <input id="especie" type="text" v-model="datos.especie" placeholder="Ej. Elfo" required />
      </div>

      <div class="form-group">
        <label for="nivel">Nivel</label>
        <input id="nivel" type="number" min="1" max="20" v-model.number="datos.nivel" required />
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
        <input id="pgTemp" type="number" min="0" v-model.number="datos.puntosVidaTemp" required />
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

// Sincronización bidireccional con el componente padre
const datos = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Clases simuladas temporalmente, idealmente provienen de useDataStore
const clasesDisponibles = ['Guerrero', 'Mago', 'Pícaro', 'Clérigo', 'Bárbaro', 'Bardo']
</script>

<style scoped>
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