<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<style>
/* Estilos globales básicos que complementan el CSS del PRD */
body {
  margin: 0;
  font-family: var(--font-family, 'Arial', sans-serif);
  background-color: var(--color-background, #f5f0e8);
  color: var(--color-text, #212121);
}

.app-container {
  min-height: 100vh;
}
</style>