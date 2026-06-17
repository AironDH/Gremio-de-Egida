<template>
  <div class="character-section">
    <div class="section-header">
      <h3 class="section-title">Ataques y Trucos</h3>
      <BaseButton variant="secondary" type="button" @click="agregarAtaque">
        + Añadir Ataque
      </BaseButton>
    </div>

    <div class="attacks-list">
      <div v-for="(ataque, index) in ataques" :key="ataque.id" class="attack-item">
        <input class="item-name" type="text" v-model="ataque.nombre" placeholder="Nombre" required />
        <input class="item-bonus" type="text" v-model="ataque.bonAtaque" placeholder="Bon. de Ataque" />
        <input class="item-damage" type="text" v-model="ataque.dano" placeholder="Daño" />
        
        <div class="type-selector-wrapper">
          <select class="item-type" v-model="ataque.tipo">
            <option value="" disabled>Tipo</option>
            <option v-for="t in datosTipos.tipos" :key="t.nombre" :value="t.nombre">
              {{ t.nombre }}
            </option>
          </select>
          
          <button 
            type="button" 
            class="info-btn" 
            @click.stop="toggleInfo(index)" 
            title="Ver ejemplos"
          >
            ?
          </button>

          <!-- Texto emergente (Tooltip) -->
          <div v-if="infoActiva === index" class="tooltip">
            <strong>Ejemplos:</strong> {{ obtenerEjemplo(ataque.tipo) }}
          </div>
        </div>

        <input class="item-notes" type="text" v-model="ataque.notas" placeholder="Notas" />
        <BaseButton variant="danger" type="button" @click="eliminarAtaque(index)">X</BaseButton>
      </div>
      
      <div v-if="ataques.length === 0" class="empty-state">
        No hay ataques o trucos registrados.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import BaseButton from '../common/BaseButton.vue'
import datosTipos from '../../data/tipos-daño.json'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const ataques = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Control del texto emergente
const infoActiva = ref(null)

const toggleInfo = (index) => {
  infoActiva.value = infoActiva.value === index ? null : index
}

const obtenerEjemplo = (nombreTipo) => {
  if (!nombreTipo) return 'Selecciona un tipo de daño primero.'
  const tipoEncontrado = datosTipos.tipos.find(t => t.nombre === nombreTipo)
  return tipoEncontrado ? tipoEncontrado.ejemplos : 'Sin ejemplos disponibles.'
}

// Cierra el tooltip si se hace clic fuera
const cerrarTooltip = () => {
  infoActiva.value = null
}

onMounted(() => {
  window.addEventListener('click', cerrarTooltip)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', cerrarTooltip)
})

// Gestión de la lista
const agregarAtaque = () => {
  const nuevosAtaques = [...ataques.value]
  nuevosAtaques.push({
    id: uuidv4(),
    nombre: '',
    bonAtaque: '',
    dano: '',
    tipo: '',
    notas: ''
  })
  ataques.value = nuevosAtaques
}

const eliminarAtaque = (index) => {
  const nuevosAtaques = [...ataques.value]
  nuevosAtaques.splice(index, 1)
  ataques.value = nuevosAtaques
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
  margin-bottom: 1rem;
}
.section-title {
  margin: 0;
  color: var(--color-primary, #7b1fa2);
}
.attacks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.attack-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.attack-item input, .attack-item select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.item-name { flex: 2; }
.item-bonus { width: 110px; }
.item-damage { width: 110px; }
.item-notes { flex: 3; }

.type-selector-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.item-type { 
  width: 140px; 
}
.info-btn {
  background: var(--color-primary-light, #ae52d4);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tooltip {
  position: absolute;
  top: 110%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  width: 200px;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
}
.tooltip::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 6px 6px 6px;
  border-style: solid;
  border-color: transparent transparent #333 transparent;
}
.empty-state {
  text-align: center;
  padding: 1rem;
  color: var(--color-text-secondary, #757575);
  font-style: italic;
}
@media (max-width: 800px) {
  .attack-item {
    flex-wrap: wrap;
  }
  .item-name, .item-notes { flex: 1 1 100%; }
}
</style>