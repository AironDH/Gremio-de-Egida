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
            @click="mostrarOpcionesIniciativa = !mostrarOpcionesIniciativa" 
            title="Configurar modificadores de iniciativa"
          >
            ⚙️
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
        <label>Velocidad (metros)</label>
        <input type="number" min="0" step="1.5" v-model.number="velocidad" />
      </div>
      
      <div class="combat-box readonly-box">
        <label>Bonificador Competencia</label>
        <div class="combat-value pb-value">+{{ combateCalculado.pb }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  ca: { type: Number, required: true },
  velocidad: { type: Number, required: true },
  combateCalculado: { type: Object, required: true },
  // NUEVO: Recibe los modificadores desde CharacterForm
  modificadoresIniciativa: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:ca', 'update:velocidad', 'update:modificadoresIniciativa'])

const mostrarOpcionesIniciativa = ref(false)

const ca = computed({
  get: () => props.ca,
  set: (value) => emit('update:ca', value)
})

const velocidad = computed({
  get: () => props.velocidad,
  set: (value) => emit('update:velocidad', value)
})

// NUEVO: Computed bidireccional para el v-model de los checkboxes
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
  position: relative; /* Para anclar el panel colapsable */
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

/* ESTILOS NUEVOS PARA LA INICIATIVA */
.iniciativa-header {
  display: flex;
  align-items: center;
  gap: 6px;
}
.iniciativa-header label {
  margin-bottom: 0; /* Anula el margin-bottom heredado para alinearse con el botón */
}
.btn-config {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0;
  opacity: 0.6;
  transition: opacity 0.2s;
  outline: none;
}
.btn-config:hover {
  opacity: 1;
}

/* Estilos del panel desplegable flotante */
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
  font-weight: normal !important; /* Sobrescribe la negrita de los labels de combat-box */
  cursor: pointer;
}
</style>