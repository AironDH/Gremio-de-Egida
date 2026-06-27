<template>
  <div class="character-section health-section">
    <div class="section-header compact-header">
      <h3 class="section-title">Salud y Descanso</h3>
      <BaseButton variant="primary" type="button" @click="restablecerTodo" class="btn-restablecer btn-sm">
        Descanso
      </BaseButton>
    </div>

    <div class="health-overview-row">
      
      <div class="health-stats-compact">
        <div class="health-input-group max-hp">
          <label for="vidaMaxima" title="Puntos de Golpe Máximos">Máx</label>
          <input id="vidaMaxima" type="number" min="1" v-model.number="vMaxima" required />
        </div>
        <div class="health-input-group current-hp">
          <label for="vidaActual" title="Puntos de Golpe Actuales">Actual</label>
          <input id="vidaActual" type="number" min="0" :max="vMaxima" v-model.number="vActual" required />
        </div>
        <div class="health-input-group temp-hp">
          <label for="vidaTemporal" title="Puntos de Golpe Temporales">Temp</label>
          <input id="vidaTemporal" type="number" min="0" v-model.number="vTemporal" placeholder="0" />
        </div>
      </div>

      <div class="hit-dice-compact" v-if="tieneDadosDeGolpe">
        <div 
          v-for="(maximo, tipoDado) in dadosGolpeMaximos" 
          :key="tipoDado"
          class="dice-pill"
        >
          <template v-if="maximo > 0">
            <span class="dice-label">{{ tipoDado.toUpperCase() }}</span>
            <span class="dice-value">{{ obtenerActual(tipoDado) }}/{{ maximo }}</span>
            <button 
              type="button" 
              class="btn-consume-dice"
              @click="consumirDado(tipoDado)"
              :disabled="obtenerActual(tipoDado) <= 0"
              title="Consumir un dado"
            >
              -
            </button>
          </template>
        </div>
      </div>
    </div>
    <div class="conditions-row ancho-total">
      <div class="conditions-header">
        <h4 class="subsection-title">Estados Activos</h4>
        <BaseButton variant="secondary" type="button" @click="mostrarModalEstados = true" class="btn-sm">
          + Gestionar Estados
        </BaseButton>
      </div>

      <div class="conditions-display">
        <div class="fixed-conditions" v-if="estadosFijos.length > 0">
          <div 
            v-for="id in estadosFijos" 
            :key="id" 
            class="condition-badge tooltip-container"
          >
            <template v-if="listaEstados.find(e => e.id === id)">
              <button 
                type="button"
                class="condition-icon-btn"
                @click="toggleTooltipEstado(id)"
                v-outside-click="() => cerrarTooltipEstado(id)"
              >
                <img 
                  :src="listaEstados.find(e => e.id === id).icon" 
                  :alt="listaEstados.find(e => e.id === id).nombre_es" 
                  class="condition-icon" 
                />
              </button>
              
              <div v-if="tooltipEstadoActivoId === id" class="condition-tooltip">
                <strong>{{ listaEstados.find(e => e.id === id).nombre_es }}</strong>
                <hr />
                <p>{{ listaEstados.find(e => e.id === id).descripcion }}</p>
              </div>
            </template>
          </div>
        </div>
        <p v-else class="empty-states">Sin estados alterados mecánicos.</p>

        <div class="custom-condition">
          <input 
            type="text" 
            v-model="ePersonalizado" 
            placeholder="Otros efectos (ej. Quemado, Maldito...)" 
            class="custom-condition-input"
          />
        </div>
      </div>
    </div>

    <div v-if="mostrarModalEstados" class="modal-overlay" @click.self="mostrarModalEstados = false">
      <div class="modal-content conditions-modal">
        <div class="modal-header">
          <h3>Catálogo de Estados Alterados</h3>
          <button type="button" class="btn-close-modal" @click="mostrarModalEstados = false">&times;</button>
        </div>

        <div class="states-grid">
          <button
            v-for="estado in listaEstados"
            :key="estado.id"
            type="button"
            class="state-toggle-btn"
            :class="{ 'is-active': estadosFijos.includes(estado.id) }"
            @click="toggleEstado(estado.id)"
          >
            <img :src="estado.icon" :alt="estado.nombre_es" class="state-btn-icon" />
            <span class="state-btn-name">{{ estado.nombre_es }}</span>
          </button>
        </div>

        <div class="modal-footer">
          <BaseButton variant="danger" type="button" @click="limpiarEstadosFijos">Limpiar Estados</BaseButton>
          <BaseButton variant="secondary" type="button" @click="mostrarModalEstados = false">Cerrar</BaseButton>
        </div>
      </div>
    </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseButton from '../common/BaseButton.vue'
import listaEstados from '../../data/estados.json' 

const props = defineProps({
  vidaMaxima: { type: Number, required: true },
  vidaActual: { type: Number, required: true },
  vidaTemporal: { type: Number, default: 0 },
  dadosGolpeActuales: { type: Object, required: true },
  dadosGolpeMaximos: { type: Object, required: true },
  // Propiedades para los Estados Alterados
  estadosFijos: { type: Array, default: () => [] },
  estadoPersonalizado: { type: String, default: '' }
})

const emit = defineEmits([
  'update:vidaMaxima', 
  'update:vidaActual', 
  'update:vidaTemporal', 
  'update:dadosGolpeActuales',
  'update:estadosFijos',
  'update:estadoPersonalizado'
])

// === Computadas para Reactividad Base ===
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

const ePersonalizado = computed({
  get: () => props.estadoPersonalizado,
  set: (val) => emit('update:estadoPersonalizado', val)
})

// === Lógica de Dados de Golpe ===
const tieneDadosDeGolpe = computed(() => {
  return Object.values(props.dadosGolpeMaximos).some(max => max > 0)
})

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

// === Lógica de Estados Alterados ===
const mostrarModalEstados = ref(false)
const tooltipEstadoActivoId = ref(null)

const toggleEstado = (id) => {
  const index = props.estadosFijos.indexOf(id)
  let nuevosEstados = [...props.estadosFijos]
  
  if (index === -1) {
    nuevosEstados.push(id)
  } else {
    nuevosEstados.splice(index, 1)
  }
  
  emit('update:estadosFijos', nuevosEstados)
}

const limpiarEstadosFijos = () => {
  emit('update:estadosFijos', [])
}

// Control de Tooltips
const toggleTooltipEstado = (id) => {
  tooltipEstadoActivoId.value = tooltipEstadoActivoId.value === id ? null : id
}

const cerrarTooltipEstado = (id) => {
  if (tooltipEstadoActivoId.value === id) {
    tooltipEstadoActivoId.value = null
  }
}

// Acción del Descanso (ACTUALIZADO)
const restablecerTodo = () => {
  vActual.value = vMaxima.value
  vTemporal.value = 0
  
  const dadosAlMaximo = { ...props.dadosGolpeMaximos }
  emit('update:dadosGolpeActuales', dadosAlMaximo)
  
  // Limpia los estados fijos (el agotamiento u otros podrían requerir lógica extra en el futuro, pero esto limpia la base)
  limpiarEstadosFijos()
}

// Directiva simple para cerrar tooltips al hacer clic fuera
const vOutsideClick = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>

<style scoped>
/* --- Sección General --- */
.health-section {
  padding: 1.5rem;
  background: var(--color-surface, #ffffff);
  border-radius: var(--border-radius, 4px);
  margin-bottom: 1rem;
}
.compact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.section-title {
  margin: 0;
  color: var(--color-primary, #7b1fa2);
}
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
}

/* --- 1. Salud y Dados Compactos --- */
.health-overview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.health-stats-compact {
  display: flex;
  gap: 0.5rem;
  flex: 1 1 auto;
}
.health-input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: var(--color-background, #f5f0e8);
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  flex: 1;
}
.health-input-group label {
  font-size: 0.75rem;
  font-weight: bold;
  color: var(--color-text-secondary, #757575);
  cursor: help;
}
.health-input-group input {
  width: 100%;
  min-width: 50px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.15rem;
}
.current-hp { 
  border-color: var(--color-success, #4caf50); 
  background: #f1f8e9; 
}
.temp-hp { 
  border-color: #64b5f6; 
  background: #e3f2fd; 
}

/* Dados de Golpe */
.hit-dice-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.dice-pill {
  display: flex;
  align-items: center;
  background: var(--color-background, #f5f0e8);
  border: 1px solid #d7ccc8;
  border-radius: 20px;
  padding: 0.15rem 0.25rem 0.15rem 0.75rem;
  gap: 0.5rem;
}
.dice-label {
  font-weight: bold;
  color: var(--color-primary, #7b1fa2);
  font-size: 0.9rem;
}
.dice-value {
  font-weight: bold;
  font-size: 0.9rem;
}
.btn-consume-dice {
  background: var(--color-primary-light, #ae52d4);
  color: white;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  line-height: 1;
}
.btn-consume-dice:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* --- 2. Fila de Estados Alterados --- */
.ancho-total {
  flex-grow: 1;
}
.conditions-row {
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 1rem;
}
.conditions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.subsection-title {
  margin: 0;
  color: var(--color-text, #212121);
  font-size: 1rem;
}
.conditions-display {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}
.fixed-conditions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.condition-icon-btn {
  background: none;
  border: 2px solid transparent;
  padding: 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: transform 0.2s;
}
.condition-icon-btn:hover {
  transform: scale(1.1);
  border-color: var(--color-primary-light, #ae52d4);
}
.condition-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
.empty-states {
  font-size: 0.85rem;
  color: #9e9e9e;
  font-style: italic;
  margin: 0;
}
.custom-condition {
  flex: 1;
  min-width: 200px;
}
.custom-condition-input {
  width: 100%;
  padding: 0.4rem;
  border: 1px dashed #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  background: #fff;
}

/* --- 3. Tooltips de Estados --- */
.tooltip-container {
  position: relative;
}
.condition-tooltip {
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: max-content;
  max-width: 250px;
  background: #2c3e50;
  color: #ecf0f1;
  padding: 0.75rem;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 0.85rem;
  text-align: left;
}
.condition-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -6px;
  border-width: 6px;
  border-style: solid;
  border-color: #2c3e50 transparent transparent transparent;
}
.condition-tooltip strong {
  color: #f1c40f;
  display: block;
  margin-bottom: 0.25rem;
}
.condition-tooltip hr {
  border: 0;
  border-top: 1px solid #34495e;
  margin: 0.25rem 0 0.5rem 0;
}
.condition-tooltip p {
  margin: 0;
  line-height: 1.3;
}

/* --- 4. Modal de Estados --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  padding: 1.5rem;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.modal-header h3 {
  margin: 0;
  color: var(--color-primary, #7b1fa2);
}
.btn-close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}
.states-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  overflow-y: auto;
  padding: 0.5rem;
  margin-bottom: 1rem;
}
.state-toggle-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 0.75rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 0.5rem;
}
.state-toggle-btn:hover {
  background: #e0e0e0;
}
.state-toggle-btn.is-active {
  background: #f3e5f5;
  border-color: var(--color-primary, #7b1fa2);
  box-shadow: 0 0 8px rgba(123, 31, 162, 0.3);
}
.state-btn-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
.state-btn-name {
  font-size: 0.8rem;
  font-weight: bold;
  color: #333;
  text-align: center;
}
.modal-footer {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}
</style>