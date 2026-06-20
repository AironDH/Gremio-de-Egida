<template>
  <div class="character-section">
    <h3 class="section-title">Características de Combate</h3>
    <div class="combat-grid">
      <div class="combat-box">
        <label>Clase de Armadura (CA)</label>
        <input type="number" min="1" v-model.number="ca" />
      </div>
      
      <div class="combat-box readonly-box">
        <label>Iniciativa</label>
        <div class="combat-value">{{ formatearModificador(combateCalculado.iniciativa) }}</div>
      </div>
      
      <div class="combat-box">
        <label>Velocidad (pies)</label>
        <input type="number" min="0" step="5" v-model.number="velocidad" />
      </div>
      
      <div class="combat-box readonly-box">
        <label>Bonificador Competencia</label>
        <div class="combat-value pb-value">+{{ combateCalculado.pb }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  ca: { type: Number, required: true },
  velocidad: { type: Number, required: true },
  combateCalculado: { type: Object, required: true }
})

const emit = defineEmits(['update:ca', 'update:velocidad'])

const ca = computed({
  get: () => props.ca,
  set: (value) => emit('update:ca', value)
})

const velocidad = computed({
  get: () => props.velocidad,
  set: (value) => emit('update:velocidad', value)
})

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
.combat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}
.combat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--color-background, #f5f0e8);
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.combat-box label {
  font-weight: bold;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: var(--color-text, #212121);
  text-align: center;
}
.combat-box input {
  width: 70px;
  text-align: center;
  font-size: 1.2rem;
  padding: 0.25rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.combat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-text, #212121);
  padding: 0.25rem 0;
}
.pb-value {
  color: var(--color-success, #4caf50);
}
.readonly-box {
  background: var(--color-surface-alt, #e8e0d0);
  border-color: #d7ccc8;
}
</style>