<template>
  <div class="base-card">
    <div v-if="$slots.header" class="base-card__header">
      <slot name="header"></slot>
    </div>
    <div class="base-card__body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style scoped>
.base-card {
  background: var(--color-surface, #ffffff);
  border-radius: var(--border-radius, 4px);
  box-shadow: var(--box-shadow, 0 2px 4px rgba(0,0,0,0.1));
  overflow: hidden;
}
.base-card__header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}
.base-card__body {
  padding: 1rem;
}
.base-card__footer {
  padding: 1rem;
  background: var(--color-background, #f5f0e8);
}
</style>