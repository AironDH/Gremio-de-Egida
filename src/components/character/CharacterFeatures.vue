<template>
  <div class="character-section">
    <h3 class="section-title">Características de Combate</h3>
    <div class="combat-grid">
      <div class="combat-box">
        <label>Clase de Armadura (CA)</label>
        <input type="number" min="1" v-model.number="ca" />
      </div>
      
      <div class="combat-box readonly-box iniciativa-box">
        <div class="iniciativa-header">
          <label>Iniciativa</label>
          <button 
            type="button" 
            class="btn-config" 
            :class="{ 'is-active': mostrarOpcionesIniciativa }"
            @click="mostrarOpcionesIniciativa = !mostrarOpcionesIniciativa" 
            title="Configurar modificadores de iniciativa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
        <div class="combat-value">{{ formatearModificador(combateCalculado.iniciativa) }}</div>
        
        <div v-if="mostrarOpcionesIniciativa" class="iniciativa-config-panel">
          <h5>Bonificadores Extra</h5>
          <label class="checkbox-label">
            <input type="checkbox" value="medio_pb" v-model="modificadoresLocales" /> Medio Competencia
          </label>
          <label class="checkbox-label">
            <input type="checkbox" value="pb" v-model="modificadoresLocales" /> Competencia
          </label>
          <label class="checkbox-label">
            <input type="checkbox" value="inteligencia" v-model="modificadoresLocales" /> Inteligencia
          </label>
          <label class="checkbox-label">
            <input type="checkbox" value="sabiduria" v-model="modificadoresLocales" /> Sabiduría
          </label>
          <label class="checkbox-label">
            <input type="checkbox" value="carisma" v-model="modificadoresLocales" /> Carisma
          </label>
        </div>
      </div>
      
      <div class="combat-box">
        <label>Velocidad (Metros)</label>
        <input type="number" min="0" step="1.5" v-model.number="velocidad" />
        <span class="speed-helper-text">Equivale a {{ casillasVelocidad }} casillas</span>
      </div>
      
      <div class="combat-box readonly-box">
        <label>Bonificador Competencia</label>
        <div class="combat-value pb-value">+{{ combateCalculado.pb }}</div>
      </div>

      <label class="combat-box inspiration-box" :class="{ 'is-active': inspiracion }">
        <span class="inspiration-title">Inspiración</span>
        <input type="checkbox" v-model="inspiracion" class="hidden-checkbox" />
        
        <div class="d20-container">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            class="d20-icon" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="1.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          >
            <polygon points="12 2 22 8 22 16 12 22 2 16 2 8 12 2"></polygon>
            <polyline points="2 8 12 13 22 8"></polyline>
            <line x1="12" y1="13" x2="12" y2="22"></line>
            <polyline points="2 16 12 13 7.5 2"></polyline>
            <polyline points="22 16 12 13 16.5 2"></polyline>
          </svg>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  ca: { type: Number, required: true },
  velocidad: { type: Number, required: true },
  combateCalculado: { type: Object, required: true },
  modificadoresIniciativa: { type: Array, default: () => [] },
  inspiracion: { type: Boolean, default: false }
})

const emit = defineEmits([
  'update:ca',
  'update:velocidad', 
  'update:modificadoresIniciativa',
  'update:inspiracion'
])

const mostrarOpcionesIniciativa = ref(false)

const ca = computed({
  get: () => props.ca,
  set: (value) => emit('update:ca', value)
})

const velocidad = computed({
  get: () => props.velocidad,
  set: (value) => emit('update:velocidad', value)
})

const inspiracion = computed({
  get: () => props.inspiracion,
  set: (value) => emit('update:inspiracion', value)
})

// Cálculo dinámico de casillas redondeando hacia abajo de manera segura
const casillasVelocidad = computed(() => {
  return Math.floor((velocidad.value || 0) / 1.5)
})

const modificadoresLocales = computed({
  get: () => props.modificadoresIniciativa,
  set: (value) => emit('update:modificadoresIniciativa', value)
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
  /* Reducimos el minmax a 110px para asegurar que entren los 5 elementos */
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.75rem; /* Gap ligeramente reducido */
}

.combat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem; /* Reducimos el padding interior para ganar espacio */
  background: var(--color-background, #f5f0e8);
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  position: relative;
}

/* Reducimos la fuente de los títulos para evitar recortes */
.combat-box label,
.inspiration-title {
  font-weight: bold;
  font-size: 0.75rem; 
  margin-bottom: 0.5rem;
  color: var(--color-text, #212121);
  text-align: center;
  transition: color 0.3s ease;
}

/* =========================================
   TARJETA DE INSPIRACIÓN
   ========================================= */

.inspiration-box {
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Ocultamos el checkbox de forma accesible */
.hidden-checkbox {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* Contenedor y diseño base del D20 */
.d20-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  margin-top: 0.25rem;
}

.d20-icon {
  width: 38px;
  height: 38px;
  color: var(--color-text-secondary, #757575);
  fill: transparent;
  /* Transición fluida con un leve efecto de rebote */
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
}

/* =========================================
   ESTADO ACTIVO (CON INSPIRACIÓN)
   ========================================= */

.inspiration-box.is-active {
  background-color: rgba(241, 196, 15, 0.1); /* Fondo dorado muy sutil */
  border-color: #f1c40f;
  box-shadow: 0 0 10px rgba(241, 196, 15, 0.25);
}

.inspiration-box.is-active .inspiration-title {
  color: #d35400; /* Título en tono cálido/dorado oscuro */
}

.inspiration-box.is-active .d20-icon {
  color: #d35400; /* Borde del dado */
  fill: #f1c40f; /* Relleno dorado brillante */
  transform: scale(1.15) rotate(10deg); /* Animación de celebración */
  filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2));
}
.combat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--color-background, #f5f0e8);
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  position: relative;
}
.combat-box label {
  font-weight: bold;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: var(--color-text, #212121);
  text-align: center;
}
.combat-box input[type="number"] {
  width: 70px;
  text-align: center;
  font-size: 1.2rem;
  padding: 0.25rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Estilo para el helper text de casillas de velocidad */
.speed-helper-text {
  font-size: 0.72rem;
  color: var(--color-text-secondary, #757575);
  margin-top: 0.35rem;
  font-style: italic;
  text-align: center;
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

.iniciativa-header {
  display: flex;
  align-items: center;
  gap: 6px;
}
.iniciativa-header label {
  margin-bottom: 0;
}
.btn-config {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.2rem; /* padding ajustado para el icono */
  color: var(--color-text-secondary, #757575); /* Color base del icono */
  transition: transform 0.3s ease, color 0.2s ease, background-color 0.2s ease, opacity 0.2s ease;
  outline: none;
  border-radius: 50%;
  display: flex; /* para alinear svg */
  align-items: center;
  justify-content: center;
  opacity: 0.6; /* opacidad inicial baja como en la original */
}

.btn-config:hover {
  opacity: 1;
  color: var(--color-primary, #7b1fa2); /* Color primario en hover */
  background-color: rgba(0, 0, 0, 0.05); /* Fondo sutil en hover */
  transform: rotate(30deg); /* Giro sutil en hover */
}

.btn-config.is-active {
  opacity: 1;
  color: var(--color-primary, #7b1fa2);
  transform: rotate(90deg); /* Giro completo de 90 grados cuando está activo */
}

.iniciativa-config-panel {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 10;
  width: max-content;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.iniciativa-config-panel::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 6px 6px 6px;
  border-style: solid;
  border-color: transparent transparent #ccc transparent;
}
.iniciativa-config-panel::after {
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 5px 5px 5px;
  border-style: solid;
  border-color: transparent transparent white transparent;
}
.iniciativa-config-panel h5 {
  margin: 0 0 4px 0;
  font-size: 0.85rem;
  color: var(--color-primary, #7b1fa2);
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: normal !important;
  cursor: pointer;
}
</style>