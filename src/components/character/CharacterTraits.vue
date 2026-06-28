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
                <div class="trait-name-row">
                  <p class="trait-description">{{ rasgo.nombre }}</p>
                  
                  <div 
                    v-if="(tipo === 'Clase' || tipo === 'Subclase') && obtenerInfoRasgo(rasgo)" 
                    class="tooltip-container"
                  >
                    <button 
                      type="button" 
                      class="btn-info" 
                      @click="toggleTooltip(`${rasgo.nombre}-${rasgo.origen}`)"
                      v-outside-click="() => cerrarTooltip(`${rasgo.nombre}-${rasgo.origen}`)"
                    >
                      ?
                    </button>
                    
                    <div v-if="tooltipActivoId === `${rasgo.nombre}-${rasgo.origen}`" class="trait-tooltip">
                      <div class="tooltip-header">
                        <h5>{{ obtenerInfoRasgo(rasgo).nombre }}</h5>
                      </div>
                      <hr />
                      <p class="tooltip-effect">{{ obtenerInfoRasgo(rasgo).efecto }}</p>
                      
                      <div class="tooltip-details">
                        <p v-if="obtenerInfoRasgo(rasgo).activacion">
                          <strong>Activación:</strong> {{ obtenerInfoRasgo(rasgo).activacion }}
                        </p>
                        <p v-if="obtenerInfoRasgo(rasgo).usos">
                          <strong>Usos:</strong> {{ obtenerInfoRasgo(rasgo).usos }}
                        </p>
                        <p v-if="obtenerInfoRasgo(rasgo).duración">
                          <strong>Duración:</strong> {{ obtenerInfoRasgo(rasgo).duración }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </li>
          </ul>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import datosRasgosClase from '../../data/rasgos-clase.json'

const props = defineProps({
  rasgos: {
    type: Array,
    default: () => []
  },
  clasesPersonaje: {
    type: Array,
    default: () => []
  }
})

// === Estado de los Acordeones ===
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
  const grupos = {
    Raza: [],
    Clase: [],
    Subclase: [],
    Dotes: []
  }

  props.rasgos.forEach(rasgo => {
    if (grupos[rasgo.tipo]) {
      grupos[rasgo.tipo].push(rasgo)
    } else {
      grupos[rasgo.tipo] = [rasgo]
    }
  })

  const gruposConContenido = {}
  for (const key in grupos) {
    if (grupos[key] && grupos[key].length > 0) {
      gruposConContenido[key] = grupos[key]
    }
  }

  return gruposConContenido
})

// === Lógica de Tooltips y Datos de Rasgos ===
const tooltipActivoId = ref(null)

const toggleTooltip = (id) => {
  tooltipActivoId.value = tooltipActivoId.value === id ? null : id
}

const cerrarTooltip = (id) => {
  if (tooltipActivoId.value === id) {
    tooltipActivoId.value = null
  }
}

const obtenerInfoRasgo = (rasgo) => {
  if (!rasgo || !props.clasesPersonaje || props.clasesPersonaje.length === 0) return null

  // Normalizamos las clases actuales del personaje a minúsculas para evitar fallos por mayúsculas
  const nombresClasesActivas = props.clasesPersonaje
    .map(c => c.nombre?.toLowerCase())
    .filter(Boolean)

  // Iteramos sobre las llaves del JSON (ej: "Bárbaro", "Pícaro")
  for (const [claseJson, listaRasgos] of Object.entries(datosRasgosClase)) {
    if (nombresClasesActivas.includes(claseJson.toLowerCase())) {
      // Si el personaje tiene esta clase, buscamos el rasgo por nombre dentro de su array
      const rasgoEncontrado = listaRasgos.find(r => r.nombre === rasgo.nombre)
      if (rasgoEncontrado) return rasgoEncontrado
    }
  }

  return null
}

// === Directivas ===
const vOutsideClick = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
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

/* Diseño específico para el nombre destacado de las dotes */
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
  overflow: visible; /* <-- CAMBIO CLAVE: Reemplaza 'hidden' por 'visible' para que el tooltip pueda salir */
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
  /* CAMBIO CLAVE: Redondeamos las esquinas superiores aquí directamente para compensar la falta del overflow: hidden */
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
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
/* =========================================
   NUEVAS CLASES PARA TOOLTIPS DE RASGOS
   ========================================= */

/* Contenedor de la fila para alinear el título del rasgo y el botón */
.trait-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.trait-name-row .trait-description {
  margin: 0;
  flex: 1; /* Permite que el texto respire y empuja el botón a la derecha */
}

/* Botón de información (?) sutil e integrado */
.btn-info {
  background: var(--color-primary-light, #ae52d4);
  color: white;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
}
.btn-info:hover {
  background: var(--color-primary, #7b1fa2);
}

/* Posicionamiento relativo para anclar el tooltip al botón */
.tooltip-container {
  position: relative;
  display: inline-block;
}

/* Diseño del Tooltip Flotante */
.trait-tooltip {
  position: absolute;
  bottom: 130%; /* Flota por encima del botón */
  right: -5px;  /* Anclado ligeramente a la derecha para no salirse de móviles */
  z-index: 300;
  width: 280px; 
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  font-size: 0.85rem;
  text-align: left;
  cursor: default;
}

/* Triángulo inferior del tooltip apuntando al botón */
.trait-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  right: 10px;
  border-width: 6px;
  border-style: solid;
  border-color: #2c3e50 transparent transparent transparent;
}

/* Tipografía interior y separación visual */
.tooltip-header {
  margin-bottom: 0.5rem;
}
.tooltip-header h5 {
  margin: 0;
  font-size: 1rem;
  color: #f1c40f; /* Resalta el nombre en amarillo oro */
}
.trait-tooltip hr {
  border: 0;
  border-top: 1px solid #34495e;
  margin: 0.5rem 0;
}
.tooltip-effect {
  line-height: 1.4;
  margin: 0 0 0.75rem 0;
}

/* Bloque destacado para variables mecánicas (Usos, Duración, Activación) */
.tooltip-details {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border-left: 3px solid #f1c40f; /* Acento visual a la izquierda */
}
.tooltip-details p {
  margin: 0 0 0.4rem 0;
  line-height: 1.3;
}
.tooltip-details p:last-child {
  margin-bottom: 0;
}
.tooltip-details strong {
  color: #bdc3c7; /* Un gris claro para separar la etiqueta del valor */
  display: inline-block;
  min-width: 70px;
}
</style>