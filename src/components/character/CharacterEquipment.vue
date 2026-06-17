<template>
  <div class="character-section">
    <div class="section-header">
      <h3 class="section-title">Equipo y Pertinencias</h3>
      <BaseButton variant="secondary" type="button" @click="agregarItem">
        + Añadir Objeto
      </BaseButton>
    </div>

    <div class="equipment-list">
      <div v-for="(item, index) in equipo" :key="item.id" class="equipment-item">
        <input class="item-name" type="text" v-model="item.nombre" placeholder="Nombre del objeto" required />
        <input class="item-qty" type="number" min="1" v-model.number="item.cantidad" placeholder="Cant." title="Cantidad" required />
        <input class="item-weight" type="number" min="0" step="0.1" v-model.number="item.peso" placeholder="Peso" title="Peso" />
        <input class="item-notes" type="text" v-model="item.notas" placeholder="Notas (opcional)" />
        <BaseButton variant="danger" type="button" @click="eliminarItem(index)">X</BaseButton>
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
.section-title {
  margin: 0;
  color: var(--color-primary, #7b1fa2);
}
.equipment-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.equipment-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.equipment-item input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.item-name { flex: 2; }
.item-qty, .item-weight { width: 70px; }
.item-notes { flex: 3; }
.empty-state {
  text-align: center;
  padding: 1rem;
  color: var(--color-text-secondary, #757575);
  font-style: italic;
}
@media (max-width: 640px) {
  .equipment-item {
    flex-wrap: wrap;
  }
  .item-name, .item-notes { flex: 1 1 100%; }
}
</style>