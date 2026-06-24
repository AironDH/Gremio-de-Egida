<template>
  <div v-if="requiereMejora" class="level-up-alert">
    <p>
      <strong>¡Mejora Disponible!</strong> Tu nivel de {{ claseTrigger }} te otorga 
      {{ cantidadMejoras }} mejora(s) de característica o dote.
    </p>
    <BaseButton variant="primary" type="button" @click="$emit('abrir-modal')">
      Seleccionar Mejora
    </BaseButton>
  </div>
</template>

<script setup>
import BaseButton from '../common/BaseButton.vue' // Importación vital para evitar fallos de compilación

defineProps({
  requiereMejora: Boolean,
  claseTrigger: String,
  cantidadMejoras: Number
})

defineEmits(['abrir-modal'])
</script>

<style scoped>
.level-up-alert {
  background-color: var(--color-warning, #ff9800);
  color: #fff;
  padding: 1rem;
  border-radius: var(--border-radius, 4px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>