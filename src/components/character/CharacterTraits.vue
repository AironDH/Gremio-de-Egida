<template>
  <div class="character-section">

    <div class="character-traits">
      <h3>Rasgos y Dotes del Personaje</h3>
      
      <div v-if="!rasgos || rasgos.length === 0" class="empty-state">
        <p>Aún no has adquirido rasgos o dotes. Selecciona una raza, clase o trasfondo.</p>
      </div>

      <div v-else class="traits-container">
        <div 
          v-for="(lista, tipo) in rasgosAgrupados" 
          :key="tipo" 
          class="trait-group"
        >
          <div 
            class="group-header" 
            @click="toggleGrupo(tipo)"
            :class="tipo.toLowerCase()"
          >
            <div class="group-title">
              <h4>{{ tipo === 'Dotes' ? 'Dotes Seleccionadas' : 'Rasgos de ' + tipo }}</h4>
              <span class="trait-count">{{ lista.length }}</span>
            </div>
            <span class="toggle-icon" :class="{ 'is-collapsed': gruposContraidos[tipo] }">
              ▼
            </span>
          </div>

          <ul v-show="!gruposContraidos[tipo]" class="traits-list">
            <li v-for="(rasgo, index) in lista" :key="index" class="trait-item">
              <div class="trait-meta">
                <span class="trait-source">{{ rasgo.origen }}</span>
                <span v-if="rasgo.nivel && tipo !== 'Dotes'" class="trait-level">Nivel {{ rasgo.nivel }}</span>
              </div>
              
              <template v-if="tipo === 'Dotes'">
                <h5 class="dote-title">{{ rasgo.nombre }}</h5>
                <p class="trait-description">{{ rasgo.descripcion }}</p>
              </template>
              
              <template v-else>
                <p class="trait-description">{{ rasgo.nombre }}</p>
              </template>
            </li>
          </ul>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, defineProps } from 'vue'

const props = defineProps({
  rasgos: {
    type: Array,
    default: () => []
  }
})

// Añadimos el estado colapsable inicial para el nuevo bloque
const gruposContraidos = ref({
  Raza: false,
  Clase: false,
  Subclase: false,
  Dotes: false
})

const toggleGrupo = (tipo) => {
  gruposContraidos.value[tipo] = !gruposContraidos.value[tipo]
}

const rasgosAgrupados = computed(() => {
  // Inicializamos incluyendo el nuevo contenedor de dotes
  const grupos = {
    Raza: [],
    Clase: [],
    Subclase: [],
    Dotes: []
  }

  // Clasificamos cada elemento según el tipo asignado en el motor de useLevelUp
  props.rasgos.forEach(rasgo => {
    if (grupos[rasgo.tipo]) {
      grupos[rasgo.tipo].push(rasgo)
    } else {
      grupos[rasgo.tipo] = [rasgo]
    }
  })

  // Limpiamos los grupos vacíos para no renderizar acordeones innecesarios
  const gruposConContenido = {}
  for (const key in grupos) {
    if (grupos[key] && grupos[key].length > 0) {
      gruposConContenido[key] = grupos[key]
    }
  }

  return gruposConContenido
})
</script>

<style scoped>
.character-section {
  padding: 1.5rem;
  background: var(--color-surface, #ffffff);
  border-radius: var(--border-radius, 4px);
  margin-bottom: 1rem;
}
.character-traits {
  margin-top: 20px;
}
.traits-list {
  list-style-type: none;
  padding: 0;
}
.trait-item {
  background-color: #f9f9f9;
  border-left: 4px solid #333;
  margin-bottom: 10px;
  padding: 10px 15px;
  border-radius: 4px;
}
.trait-description {
  margin: 0;
  font-size: 0.95em;
  color: #222;
  line-height: 1.4;
}

/* NUEVO: Diseño específico para el nombre destacado de las dotes */
.dote-title {
  margin: 0 0 6px 0;
  font-size: 1rem;
  color: var(--color-primary, #7b1fa2);
  font-weight: bold;
}

.empty-state {
  color: #666;
  font-style: italic;
}
.trait-group {
  margin-bottom: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

/* Estilos del encabezado colapsable */
.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  background-color: #f5f5f5;
  transition: background-color 0.2s;
  user-select: none;
}
.group-header:hover {
  filter: brightness(0.95);
}

/* Indicadores de color laterales de los acordeones */
.group-header.raza { border-left: 5px solid #28a745; }
.group-header.clase { border-left: 5px solid #007bff; }
.group-header.subclase { border-left: 5px solid #ffc107; }
.group-header.dotes { border-left: 5px solid #7b1fa2; } /* NUEVO: Color púrpura heráldico para dotes */

.group-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.group-title h4 {
  margin: 0;
  font-size: 1.1em;
  color: #333;
}
.trait-count {
  background: rgba(0,0,0,0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
}

/* Animación de la flecha */
.toggle-icon {
  font-size: 0.8em;
  transition: transform 0.3s ease;
}
.toggle-icon.is-collapsed {
  transform: rotate(-90deg);
}

/* Estilos de la lista interna */
.traits-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid #e0e0e0;
}
.trait-item {
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
}
.trait-item:last-child {
  border-bottom: none;
}
.trait-meta {
  font-size: 0.85em;
  color: #666;
  margin-bottom: 4px;
  display: flex;
  gap: 8px;
}
.trait-source {
  font-weight: bold;
  color: #444;
}
.trait-level {
  background-color: #eee;
  padding: 1px 5px;
  border-radius: 3px;
}
</style>