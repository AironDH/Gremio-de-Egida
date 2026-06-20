<template>
  <BaseCard class="character-card">
    <template #header>
      <div class="character-card__header">
        <h3>{{ personaje.nombre }}</h3>
        <span class="character-card__level">Niv. {{ nivelTotal }}</span>
      </div>
    </template>

    <div class="character-card__info">
      <p><strong>Especie:</strong> {{ personaje.especie }}</p>
      <p><strong>Clases:</strong> {{ textoClases }}</p>
      <div class="character-card__hp">
        <div class="hp-bar-container">
          <div class="hp-bar" :style="{ width: porcentajeVida + '%' }"></div>
        </div>
        <span>Puntos de Vida: {{ personaje.puntosVidaActuales }} / {{ personaje.puntosVidaMax }}</span>
      </div>
    </div>

    <template #footer>
      <div class="character-card__actions">
        <BaseButton variant="secondary" @click="$emit('editar', personaje.id)">Editar</BaseButton>
        <BaseButton variant="danger" @click="$emit('eliminar', personaje.id)">Eliminar</BaseButton>
      </div>
    </template>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import BaseCard from '../common/BaseCard.vue'
import BaseButton from '../common/BaseButton.vue'

const props = defineProps({
  personaje: {
    type: Object,
    required: true
  }
})

defineEmits(['editar', 'eliminar'])

// Cálculo del nivel sumando todas las clases
const nivelTotal = computed(() => {
  if (!props.personaje.clases) return 0
  return props.personaje.clases.reduce((suma, c) => suma + (c.nivel || 0), 0)
})

// Concatenación de nombres para visualización (ej. "Mago / Pícaro")
const textoClases = computed(() => {
  if (!props.personaje.clases || props.personaje.clases.length === 0) return 'Sin clase'
  return props.personaje.clases.map(c => c.nombre).join(' / ')
})

const porcentajeVida = computed(() => {
  if (!props.personaje.puntosVidaMax) return 0
  return Math.min(100, Math.max(0, (props.personaje.puntosVidaActuales / props.personaje.puntosVidaMax) * 100))
})
</script>

<style scoped>
.character-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.character-card__header h3 {
  margin: 0;
  color: var(--color-primary, #7b1fa2);
}
.character-card__level {
  background: var(--color-primary-light, #f3e5f5);
  color: var(--color-primary, #7b1fa2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.85rem;
}
.character-card__info p {
  margin: 0.5rem 0;
}
.character-card__hp {
  margin-top: 1rem;
  font-size: 0.85rem;
}
.hp-bar-container {
  background: #e0e0e0;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}
.hp-bar {
  background: #2e7d32;
  height: 100%;
  transition: width 0.3s ease;
}
.character-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>