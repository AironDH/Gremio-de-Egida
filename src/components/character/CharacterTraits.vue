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

                <div 
                  v-if="(tipo === 'Clase' || tipo === 'Subclase') && obtenerInfoRasgo(rasgo)?.opciones" 
                  class="trait-options-action"
                >
                  <button 
                    type="button" 
                    class="btn-manage-options" 
                    @click="rasgoActivoModal = rasgo; mostrarModalOpciones = true"
                  >
                    Gestionar Opciones 
                    <span class="options-badge">
                      {{ (opcionesRasgos[rasgo.nombre] || []).length }}/{{ calcularLimiteOpciones(rasgo) }}
                    </span>
                  </button>
                </div>
              </template>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div 
      v-if="mostrarModalOpciones && rasgoActivoModal" 
      class="modal-overlay" 
      @click.self="mostrarModalOpciones = false"
    >
      <div class="modal-content options-modal">
        <div class="modal-header">
          <div class="modal-titles">
            <h3>{{ rasgoActivoModal.nombre }}</h3>
            <span class="options-counter">
              Seleccionadas: {{ (opcionesRasgos[rasgoActivoModal.nombre] || []).length }} de {{ calcularLimiteOpciones(rasgoActivoModal) }}
            </span>
          </div>
          <button type="button" class="btn-close-modal" @click="mostrarModalOpciones = false">&times;</button>
        </div>
        
        <div class="options-grid">
          <div 
            v-for="opcion in obtenerInfoRasgo(rasgoActivoModal).opciones" 
            :key="opcion.nombre"
            class="option-card"
            :class="{ 
              'is-selected': (opcionesRasgos[rasgoActivoModal.nombre] || []).includes(opcion.nombre),
              'is-disabled': !cumpleRequisitos(opcion, rasgoActivoModal) || 
                             ( (opcionesRasgos[rasgoActivoModal.nombre] || []).length >= calcularLimiteOpciones(rasgoActivoModal) && !(opcionesRasgos[rasgoActivoModal.nombre] || []).includes(opcion.nombre) )
            }"
            @click="cumpleRequisitos(opcion, rasgoActivoModal) && toggleOpcion(opcion.nombre, rasgoActivoModal)"
          >
            <div class="option-card-header">
              <h4>{{ opcion.nombre }}</h4>
              <input 
                type="checkbox" 
                :checked="(opcionesRasgos[rasgoActivoModal.nombre] || []).includes(opcion.nombre)"
                :disabled="!cumpleRequisitos(opcion, rasgoActivoModal) || ((opcionesRasgos[rasgoActivoModal.nombre] || []).length >= calcularLimiteOpciones(rasgoActivoModal) && !(opcionesRasgos[rasgoActivoModal.nombre] || []).includes(opcion.nombre))"
                @click.stop.prevent="cumpleRequisitos(opcion, rasgoActivoModal) && toggleOpcion(opcion.nombre, rasgoActivoModal)"
              >
            </div>
            
            <p class="option-effect">{{ opcion.efecto }}</p>
            
            <div v-if="opcion.costo_activacion" class="option-cost">
              <strong>Costo:</strong> {{ opcion.costo_activacion }}
            </div>
            
            <div v-if="!cumpleRequisitos(opcion, rasgoActivoModal)" class="option-warning">
              ⚠️ Requiere: 
              <span v-if="opcion.requisitos.nivel">Nivel {{ opcion.requisitos.nivel }}</span>
              <span v-if="opcion.requisitos.nivel && opcion.requisitos.rasgo_requerido"> | </span>
              <span v-if="opcion.requisitos.rasgo_requerido">{{ opcion.requisitos.rasgo_requerido }}</span>
            </div>
          </div>
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
  },
  opcionesRasgos: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:opcionesRasgos'])

// === Estado de los Acordeones ===
const gruposContraidos = ref({
  Raza: false,
  Clase: false,
  Subclase: false,
  Dotes: false,
  Opciones: false // <-- Nuevo grupo para el template
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

  const nombresClasesActivas = props.clasesPersonaje
    .map(c => c.nombre?.toLowerCase())
    .filter(Boolean)

  for (const [claseJson, listaRasgos] of Object.entries(datosRasgosClase)) {
    if (nombresClasesActivas.includes(claseJson.toLowerCase())) {
      const rasgoEncontrado = listaRasgos.find(r => r.nombre === rasgo.nombre)
      if (rasgoEncontrado) return rasgoEncontrado
    }
  }

  return null
}

// === Lógica de Opciones Especiales de Clase ===
const mostrarModalOpciones = ref(false)
const rasgoActivoModal = ref(null)

const obtenerNivelClasePorRasgo = (rasgo) => {
  if (!rasgo) return 0
  
  // 1. Intentar coincidencia directa por origen (ej. si el origen dice "Bárbaro" o "Camino del Berserker")
  for (const clase of props.clasesPersonaje) {
    if (clase.nombre === rasgo.origen || clase.subclase === rasgo.origen) {
      return clase.nivel
    }
  }
  
  // 2. Fallback: buscar a qué clase pertenece en el JSON
  const nombresClasesActivas = props.clasesPersonaje.map(c => c.nombre?.toLowerCase()).filter(Boolean)
  for (const [claseJson, listaRasgos] of Object.entries(datosRasgosClase)) {
    if (nombresClasesActivas.includes(claseJson.toLowerCase())) {
      if (listaRasgos.some(r => r.nombre === rasgo.nombre)) {
        const claseEncontrada = props.clasesPersonaje.find(c => c.nombre?.toLowerCase() === claseJson.toLowerCase())
        if (claseEncontrada) return claseEncontrada.nivel
      }
    }
  }
  return 0
}

const calcularLimiteOpciones = (rasgo) => {
  const infoJson = obtenerInfoRasgo(rasgo)
  if (!infoJson || !infoJson['nro-opciones']) return 0

  const nivelClase = obtenerNivelClasePorRasgo(rasgo)
  let limite = 0

  // Ordenamos los niveles numéricamente (ej: ["2", "5", "11"])
  const nivelesCambio = Object.keys(infoJson['nro-opciones']).map(Number).sort((a, b) => a - b)
  
  for (const nivelClave of nivelesCambio) {
    if (nivelClase >= nivelClave) {
      limite = infoJson['nro-opciones'][nivelClave]
    } else {
      break
    }
  }
  
  return limite
}

const cumpleRequisitos = (opcion, rasgo = rasgoActivoModal.value) => {
  if (!opcion.requisitos) return true
  
  let cumple = true
  
  if (opcion.requisitos.nivel) {
    const nivelClase = obtenerNivelClasePorRasgo(rasgo)
    if (nivelClase < opcion.requisitos.nivel) cumple = false
  }
  
  if (opcion.requisitos.rasgo_requerido) {
    const tieneRasgo = props.rasgos.some(r => r.nombre.toLowerCase() === opcion.requisitos.rasgo_requerido.toLowerCase())
    if (!tieneRasgo) cumple = false
  }
  
  return cumple
}

const toggleOpcion = (nombreOpcion, rasgo = rasgoActivoModal.value) => {
  if (!rasgo) return

  const limite = calcularLimiteOpciones(rasgo)
  const opcionesActualizadas = JSON.parse(JSON.stringify(props.opcionesRasgos)) // Copia para no mutar props directamente
  
  if (!opcionesActualizadas[rasgo.nombre]) {
    opcionesActualizadas[rasgo.nombre] = []
  }
  
  const seleccionadas = opcionesActualizadas[rasgo.nombre]
  const index = seleccionadas.indexOf(nombreOpcion)
  
  if (index !== -1) {
    seleccionadas.splice(index, 1) // Quitar si ya está seleccionada
  } else {
    if (seleccionadas.length < limite) {
      seleccionadas.push(nombreOpcion) // Añadir si hay cupo
    }
  }
  
  // Si quitamos todas las opciones, eliminamos la llave para mantener limpio el objeto
  if (seleccionadas.length === 0) {
    delete opcionesActualizadas[rasgo.nombre]
  }
  
  emit('update:opcionesRasgos', opcionesActualizadas)
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
   CLASES PARA TOOLTIPS DE RASGOS
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

/* =========================================
   CLASES PARA OPCIONES DE CLASE
   ========================================= */

/* Botón de Gestionar Opciones (Secundario y sutil) */
.trait-options-action {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.btn-manage-options {
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-manage-options:hover {
  background-color: #e0e0e0;
  color: #333;
}

.options-badge {
  background-color: var(--color-primary, #7b1fa2);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: bold;
}

/* =========================================
   MODAL DE OPCIONES (Superposición y Contenedor)
   ========================================= */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.options-modal {
  background: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 650px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  padding: 1.5rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

.modal-titles h3 {
  margin: 0 0 0.25rem 0;
  color: var(--color-primary, #7b1fa2);
}

.options-counter {
  font-size: 0.85rem;
  color: #666;
  font-weight: bold;
}

.btn-close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  line-height: 1;
}

.btn-close-modal:hover {
  color: #333;
}

/* =========================================
   TARJETAS DE OPCIONES (Grid y Estados)
   ========================================= */

.options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  overflow-y: auto;
  padding-right: 0.5rem; /* Espacio para la barra de scroll */
}

@media (min-width: 600px) {
  .options-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Estado 1: Normal */
.option-card {
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.option-card:hover:not(.is-disabled) {
  border-color: #bdbdbd;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.option-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.option-card-header h4 {
  margin: 0;
  font-size: 0.95rem;
  color: #333;
  line-height: 1.2;
}

.option-card-header input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary, #7b1fa2);
  flex-shrink: 0;
}

.option-effect {
  font-size: 0.85rem;
  line-height: 1.4;
  color: #555;
  margin: 0 0 0.5rem 0;
  flex-grow: 1; /* Empuja el costo y la advertencia hacia abajo */
}

.option-cost {
  font-size: 0.8rem;
  background: #e0e0e0;
  color: #333;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  align-self: flex-start;
  margin-bottom: 0.5rem;
}

/* Estado 2: Seleccionado */
.option-card.is-selected {
  background: #f4ecf7; /* Tono morado muy claro */
  border-color: var(--color-primary, #7b1fa2);
  box-shadow: 0 0 0 1px var(--color-primary, #7b1fa2);
}

.option-card.is-selected .option-card-header h4 {
  color: var(--color-primary, #7b1fa2);
}

/* Estado 3: Bloqueado / Requisitos no cumplidos */
.option-card.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background: #f5f5f5;
  border-color: #e0e0e0;
  filter: grayscale(20%);
}

.option-card.is-disabled:hover {
  border-color: #e0e0e0;
  box-shadow: none;
}

.option-card.is-disabled .option-card-header input[type="checkbox"] {
  cursor: not-allowed;
}

/* Texto de Advertencia (Rojo/Naranja sutil) */
.option-warning {
  margin-top: auto; /* Se asegura de ir siempre al fondo de la tarjeta */
  padding-top: 0.5rem;
  font-size: 0.8rem;
  color: #d35400; 
  font-weight: bold;
  border-top: 1px dashed #d35400;
}
</style>