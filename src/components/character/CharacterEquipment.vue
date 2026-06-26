<template>
  <div class="character-section">
    <div class="section-header">
      <div class="header-title-group">
        <h3 class="section-title">Equipo y Pertinencias</h3>
        <div 
          class="weight-indicator" 
          :class="{ 'exceso-peso': (pesoActualEquipado) > (capacidadCargaCalculada) }"
        >
          Peso Actual / Capacidad Máxima (kg): {{ (pesoActualEquipado).toFixed(1) }} / {{ (capacidadCargaCalculada).toFixed(1) }}
        </div>
      </div>
      <BaseButton variant="secondary" type="button" @click="agregarItem">
        + Añadir Objeto
      </BaseButton>
    </div>

    <div class="equipment-list">
      <!-- Encabezado de la tabla -->
      <div v-if="equipo.length > 0" class="equipment-header">
        <div class="col-name">Nombre</div>
        <div class="col-qty">Cant.</div>
        <div class="col-weight">Peso (kg)</div>
        <div class="col-notes">Notas Adicionales</div>
        <div class="col-action"></div>
      </div>

      <div v-for="(item, index) in equipo" :key="item.id" class="equipment-item">
        <input class="col-name" type="text" v-model="item.nombre" placeholder="Nombre del objeto" required />
        <input class="col-qty" type="number" min="1" v-model.number="item.cantidad" placeholder="Cant." title="Cantidad" required />
        <input class="col-weight" type="number" min="0" step="0.01" v-model.number="item.peso" placeholder="Peso" title="Peso en Kg" />
        <input class="col-notes" type="text" v-model="item.notas" placeholder="Notas (opcional)" />
        <div class="col-action">
          <BaseButton variant="danger" type="button" @click="eliminarItem(index)">X</BaseButton>
        </div>
      </div>
      
      <div v-if="equipo.length === 0" class="empty-state">
        No hay objetos en el inventario.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import BaseButton from '../common/BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  },
  pesoActualEquipado: {
    type: Number,
    default: 0
  },
  capacidadCargaCalculada: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

const equipo = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const agregarItem = () => {
  const nuevoEquipo = [...equipo.value]
  nuevoEquipo.push({
    id: uuidv4(),
    nombre: '',
    cantidad: 1,
    peso: 0,
    notas: ''
  })
  equipo.value = nuevoEquipo
}

const eliminarItem = (index) => {
  const nuevoEquipo = [...equipo.value]
  nuevoEquipo.splice(index, 1)
  equipo.value = nuevoEquipo
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
.header-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.section-title {
  margin: 0;
  color: var(--color-primary, #7b1fa2);
}
.weight-indicator {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #757575);
  font-weight: 500;
}
.exceso-peso {
  color: #d32f2f !important;
  font-weight: bold;
}
.equipment-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Reglas compartidas para mantener alineación estricta entre encabezado y fila */
.equipment-header, .equipment-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
}

.equipment-header {
  padding-bottom: 0.25rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  font-weight: bold;
  color: var(--color-text-secondary, #757575);
}

.equipment-item input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

/* Definición de Columnas - Obliga a flexbox a respetar los anchos */
.col-name { 
  flex: 2; 
  min-width: 0; 
}
.col-qty, .col-weight { 
  flex: 0 0 75px; 
  width: 75px; 
  text-align: center;
}
.col-notes { 
  flex: 3; 
  min-width: 0; 
}
.col-action { 
  flex: 0 0 40px; 
  width: 40px;
  display: flex;
  justify-content: center;
}

/* Elementos vacíos */
.empty-state {
  text-align: center;
  padding: 1rem;
  color: var(--color-text-secondary, #757575);
  font-style: italic;
}

/* Modo responsivo */
@media (max-width: 640px) {
  .equipment-header {
    display: none;
  }
  .equipment-item {
    flex-wrap: wrap;
  }
  .col-name, .col-notes { 
    flex: 1 1 100%; 
  }
  .col-qty, .col-weight, .col-action {
    flex: 1; 
  }
}
</style>