<template>
  <div class="character-section">
    <h3 class="section-title">Personalidad e Historia</h3>
    <div class="personality-grid">
      <div class="form-group">
        <label for="rasgosPersonalidad">Rasgos de Personalidad</label>
        <textarea id="rasgosPersonalidad" v-model="personalidad.rasgosPersonalidad" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label for="ideales">Ideales</label>
        <textarea id="ideales" v-model="personalidad.ideales" rows="2"></textarea>
      </div>
      <div class="form-group">
        <label for="vinculos">Vínculos</label>
        <textarea id="vinculos" v-model="personalidad.vinculos" rows="2"></textarea>
      </div>
      <div class="form-group">
        <label for="defectos">Defectos</label>
        <textarea id="defectos" v-model="personalidad.defectos" rows="2"></textarea>
      </div>
      <div class="form-group full-width">
        <label for="apariencia">Apariencia</label>
        <textarea id="apariencia" v-model="personalidad.apariencia" rows="2"></textarea>
      </div>
      <div class="form-group full-width">
        <label for="historia">Historia / Trasfondo</label>
        <textarea id="historia" v-model="personalidad.historia" rows="4"></textarea>
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

const personalidad = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
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
.personality-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.full-width {
  grid-column: 1 / -1;
}
.form-group label {
  font-weight: bold;
  font-size: 0.9rem;
  color: var(--color-text-secondary, #757575);
}
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
}
@media (max-width: 640px) {
  .personality-grid {
    grid-template-columns: 1fr;
  }
}
</style>