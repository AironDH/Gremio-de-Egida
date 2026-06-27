<template>
  <div class="character-section">
    <div class="section-header">
      <h3 class="section-title">Salud y Dados de golpe</h3>
      <BaseButton variant="primary" type="button" @click="restablecerTodo" class="btn-restablecer">
        Descanso
      </BaseButton>
    </div>

    <div class="health-grid">
      <div class="health-box">
        <label for="vidaMaxima">PG Máximos</label>
        <input id="vidaMaxima" type="number" min="1" v-model.number="vMaxima" required />
      </div>
      <div class="health-box current-hp">
        <label for="vidaActual">PG Actuales</label>
        <input id="vidaActual" type="number" min="0" :max="vMaxima" v-model.number="vActual" required />
      </div>
      <div class="health-box temp-hp">
        <label for="vidaTemporal">PG Temporales</label>
        <input id="vidaTemporal" type="number" min="0" v-model.number="vTemporal" placeholder="0" />
      </div>
    </div>

    <div class="hit-dice-section" v-if="tieneDadosDeGolpe">
      <h4 class="subsection-title">Dados de Golpe</h4>
      <div class="hit-dice-grid">
        <div 
          v-for="(maximo, tipoDado) in dadosGolpeMaximos" 
          :key="tipoDado"
          class="hit-dice-card"
        >
          <template v-if="maximo > 0">
            <div class="dice-info">
              <span class="dice-type">{{ tipoDado.toUpperCase() }}</span>
              <span class="dice-count">
                {{ obtenerActual(tipoDado) }} / {{ maximo }}
              </span>
            </div>
            <BaseButton 
              variant="secondary" 
              type="button" 
              @click="consumirDado(tipoDado)"
              :disabled="obtenerActual(tipoDado) <= 0"
              class="btn-consumir"
            >
              Consumir
            </BaseButton>
          </template>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseButton from '../common/BaseButton.vue'

const props = defineProps({
  vidaMaxima: { type: Number, required: true },
  vidaActual: { type: Number, required: true },
  vidaTemporal: { type: Number, default: 0 },
  dadosGolpeActuales: { type: Object, required: true },
  dadosGolpeMaximos: { type: Object, required: true }
})

const emit = defineEmits([
  'update:vidaMaxima', 
  'update:vidaActual', 
  'update:vidaTemporal', 
  'update:dadosGolpeActuales'
])

// Computadas para la reactividad de la vida (v-model)
const vMaxima = computed({
  get: () => props.vidaMaxima,
  set: (val) => emit('update:vidaMaxima', val)
})

const vActual = computed({
  get: () => props.vidaActual,
  set: (val) => emit('update:vidaActual', val)
})

const vTemporal = computed({
  get: () => props.vidaTemporal,
  set: (val) => emit('update:vidaTemporal', val)
})

// === Lógica de Dados de Golpe ===

const tieneDadosDeGolpe = computed(() => {
  return Object.values(props.dadosGolpeMaximos).some(max => max > 0)
})

// Si el dado aún no se ha guardado en el estado (personaje nivel 1 recién creado), se considera 0.
const obtenerActual = (tipoDado) => {
  if (props.dadosGolpeActuales && props.dadosGolpeActuales[tipoDado] !== undefined) {
    return props.dadosGolpeActuales[tipoDado]
  }
  return 0
}

const consumirDado = (tipoDado) => {
  const cantidadActual = obtenerActual(tipoDado)
  if (cantidadActual > 0) {
    const nuevosActuales = { ...props.dadosGolpeActuales, [tipoDado]: cantidadActual - 1 }
    emit('update:dadosGolpeActuales', nuevosActuales)
  }
}

// Acción del Descanso (Restablece salud, temporales y todos los dados de golpe)
const restablecerTodo = () => {
  vActual.value = vMaxima.value
  vTemporal.value = 0
  
  // Clonamos los máximos calculados para establecerlos como los actuales disponibles
  const dadosAlMaximo = { ...props.dadosGolpeMaximos }
  emit('update:dadosGolpeActuales', dadosAlMaximo)
}
</script>

<style scoped>
.character-section {
  padding: 1.5rem;
  background: var(--color-surface, #ffffff);
  border-radius: var(--border-radius, 4px);
  margin-bottom: 1rem;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}
.section-title {
  margin: 0;
  color: var(--color-primary, #7b1fa2);
}
.btn-restablecer {
  font-weight: bold;
}

/* --- Cuadrícula de Vida --- */
.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.health-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.3rem;
  background: var(--color-background, #f5f0e8);
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.health-box label {
  font-weight: bold;
  font-size: 0.85rem;
  margin-bottom: 0.2rem;
  color: var(--color-text, #212121);
}
.health-box input[type="number"] {
  width: 80px;
  text-align: center;
  font-size: 1rem;
  font-weight: bold;
  padding: 0.25rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.current-hp {
  border-color: var(--color-success, #4caf50);
  background: #f1f8e9;
}
.temp-hp {
  border-color: #64b5f6;
  background: #e3f2fd;
}

/* --- Sección de Dados de Golpe --- */
.subsection-title {
  font-size: 1.1rem;
  color: var(--color-text-secondary, #757575);
  margin-bottom: 0.75rem;
}
.hit-dice-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.hit-dice-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-background, #f5f0e8);
  border: 1px solid #d7ccc8;
  border-radius: 8px;
  padding: 0.25rem;
  min-width: 100px;
}
.dice-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0rem;
}
.dice-type {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--color-primary, #7b1fa2);
}
.dice-count {
  font-size: 1rem;
  color: var(--color-text, #212121);
}
.btn-consumir {
  width: 100%;
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
}
</style>