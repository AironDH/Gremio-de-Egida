<template>
  <button 
    :class="['base-button', `base-button--${variant}`]"
    @click="$emit('click')"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, danger
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
defineEmits(['click'])
</script>

<style scoped>
.base-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--border-radius, 4px);
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.2s;
}
.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.base-button--primary {
  background-color: var(--color-primary, #7b1fa2);
  color: white;
}
.base-button--secondary {
  background-color: var(--color-surface-alt, #e8e0d0);
  color: var(--color-text, #212121);
}
</style>