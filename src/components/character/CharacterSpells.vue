<template>
  <div class="character-section spells-section">
    <div class="section-header">
      <h3 class="section-title">Libro de Hechizos</h3>
      <BaseButton variant="primary" type="button" @click="mostrarModal = true">
        + Añadir Hechizo
      </BaseButton>
    </div>

    <div class="spells-grid-container">
      <p v-if="!modelValue.length" class="empty-state">No hay hechizos aprendidos. Haz clic en "Añadir Hechizo" para comenzar.</p>
      
      <div 
        v-for="nivel in nivelesConHechizos" 
        :key="nivel" 
        class="spell-level-card"
      >
        <h4 class="level-title">
          {{ nivel === '0' ? 'Trucos (Nivel 0)' : 'Nivel ' + nivel }}
        </h4>
        
        <ul class="spell-list">
          <li 
            v-for="hechizo in hechizosPorNivel[nivel]" 
            :key="hechizo.id" 
            class="spell-item"
          >
            <input 
              v-if="hechizo.nivel > 0" 
              type="checkbox" 
              :checked="hechizo.preparado" 
              @change="togglePreparado(hechizo.id)"
              title="Marcar como preparado"
              class="spell-prepared-checkbox"
            />
            <div v-else class="spell-cantrip-spacer"></div>

            <span class="spell-name" :class="{ 'is-prepared': hechizo.preparado || hechizo.nivel === 0 }">
              {{ hechizo.nombre }}
            </span>

            <div class="spell-actions">
              <div class="tooltip-container">
                <button 
                  type="button" 
                  class="btn-info" 
                  @click="toggleTooltip(hechizo.id)"
                  v-outside-click="() => cerrarTooltip(hechizo.id)"
                >
                  ?
                </button>
                
                <div v-if="tooltipActivoId === hechizo.id" class="spell-tooltip">
                  <div class="tooltip-header">
                    <h5>{{ obtenerInfoCompleta(hechizo.id)?.nombre }}</h5>
                    <span class="tooltip-badge">{{ obtenerInfoCompleta(hechizo.id)?.escuela }}</span>
                  </div>
                  <hr />
                  <p><strong>Tiempo:</strong> {{ obtenerInfoCompleta(hechizo.id)?.tiempo_casteo }}</p>
                  <p><strong>Alcance:</strong> {{ obtenerInfoCompleta(hechizo.id)?.alcance }}</p>
                  <p><strong>Componentes:</strong> {{ obtenerInfoCompleta(hechizo.id)?.componentes }} <span v-if="obtenerInfoCompleta(hechizo.id)?.materiales">({{ obtenerInfoCompleta(hechizo.id)?.materiales }})</span></p>
                  <p><strong>Duración:</strong> {{ obtenerInfoCompleta(hechizo.id)?.duracion }}</p>
                  <p class="tooltip-description">{{ obtenerInfoCompleta(hechizo.id)?.descripcion }}</p>
                </div>
              </div>

              <button 
                type="button" 
                class="btn-remove" 
                @click="eliminarHechizo(hechizo.id)"
                title="Eliminar hechizo"
              >
                &times;
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="mostrarModal" class="modal-overlay" @click.self="mostrarModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Catálogo de Hechizos</h3>
          <button type="button" class="btn-close-modal" @click="mostrarModal = false">&times;</button>
        </div>

        <div class="modal-controls">
          <input 
            type="text" 
            v-model="filtroNombre" 
            placeholder="Buscar por nombre..." 
            class="search-input"
          />
          <label class="checkbox-label">
            <input type="checkbox" v-model="mostrarTodos" />
            <span>Mostrar hechizos de todas las clases</span>
          </label>
        </div>

        <div class="table-container">
          <table class="spells-table">
            <thead>
              <tr>
                <th @click="cambiarOrden('nombre')" class="sortable-header">
                  Nombre
                  <span v-if="ordenColumna === 'nombre'" class="sort-icon">{{ ordenAscendente ? '▲' : '▼' }}</span>
                </th>
                <th @click="cambiarOrden('nivel')" class="sortable-header">
                  Nivel
                  <span v-if="ordenColumna === 'nivel'" class="sort-icon">{{ ordenAscendente ? '▲' : '▼' }}</span>
                </th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="hechizo in hechizosFiltradosOrdenados" :key="hechizo.id">
                <td>{{ hechizo.nombre }}</td>
                <td>{{ hechizo.nivel === 0 ? 'Truco' : hechizo.nivel }}</td>
                <td class="action-cell">
                  <BaseButton variant="secondary" type="button" @click="agregarHechizo(hechizo)" class="btn-sm">
                    Añadir
                  </BaseButton>
                </td>
              </tr>
              <tr v-if="hechizosFiltradosOrdenados.length === 0">
                <td colspan="3" class="text-center empty-table">No se encontraron hechizos con estos filtros.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseButton from '../common/BaseButton.vue'
import listaHechizos from '../../data/hechizos.json'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => []
  },
  clasesPersonaje: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

// Estados del componente
const mostrarModal = ref(false)
const mostrarTodos = ref(false)
const tooltipActivoId = ref(null)

// Estados para el filtro y ordenamiento de la tabla
const filtroNombre = ref('')
const ordenColumna = ref('nivel') // 'nombre' o 'nivel'
const ordenAscendente = ref(true)

// Nombres de las clases activas del personaje en minúsculas para el filtrado seguro
const nombresClasesActivas = computed(() => {
  return props.clasesPersonaje
    .map(c => c.nombre?.toLowerCase())
    .filter(Boolean)
})

// Filtrar el listado original de hechizos
const hechizosDisponibles = computed(() => {
  return listaHechizos.filter(hechizo => {
    // 1. Evitar duplicados
    const yaLoTiene = props.modelValue.some(h => h.id === hechizo.id)
    if (yaLoTiene) return false

    // 2. Si "Mostrar todos" está activo, saltamos el filtro de clase
    if (mostrarTodos.value) return true

    // 3. Filtro por clase coincidente
    if (!hechizo.clase || !Array.isArray(hechizo.clase)) return false
    return hechizo.clase.some(cls => nombresClasesActivas.value.includes(cls.toLowerCase()))
  })
})

// Aplicar búsqueda por texto y ordenamiento a los hechizos disponibles
const hechizosFiltradosOrdenados = computed(() => {
  let resultado = hechizosDisponibles.value

  // Filtro por nombre
  if (filtroNombre.value) {
    const busqueda = filtroNombre.value.toLowerCase()
    resultado = resultado.filter(h => h.nombre.toLowerCase().includes(busqueda))
  }

  // Ordenamiento
  resultado = [...resultado].sort((a, b) => {
    let valorA = a[ordenColumna.value]
    let valorB = b[ordenColumna.value]

    if (ordenColumna.value === 'nombre') {
      const comparacion = valorA.localeCompare(valorB)
      return ordenAscendente.value ? comparacion : -comparacion
    } else {
      if (valorA < valorB) return ordenAscendente.value ? -1 : 1
      if (valorA > valorB) return ordenAscendente.value ? 1 : -1
      return 0
    }
  })

  return resultado
})

// Agrupar los hechizos del personaje por nivel de conjuro de forma reactiva
const hechizosPorNivel = computed(() => {
  const grupos = {}
  props.modelValue.forEach(hechizo => {
    const nivel = hechizo.nivel.toString()
    if (!grupos[nivel]) {
      grupos[nivel] = []
    }
    grupos[nivel].push(hechizo)
  })
  return grupos
})

// Obtener una lista ordenada de niveles que contienen al menos un hechizo
const nivelesConHechizos = computed(() => {
  return Object.keys(hechizosPorNivel.value).sort((a, b) => parseInt(a) - parseInt(b))
})

// === Operaciones del Estado / Mutaciones ===

const cambiarOrden = (columna) => {
  if (ordenColumna.value === columna) {
    ordenAscendente.value = !ordenAscendente.value
  } else {
    ordenColumna.value = columna
    ordenAscendente.value = true // Por defecto ascendente al cambiar de columna
  }
}

const agregarHechizo = (hechizo) => {
  const nuevoHechizo = {
    id: hechizo.id,
    nombre: hechizo.nombre,
    nivel: hechizo.nivel,
    preparado: hechizo.nivel === 0 // Los trucos se marcan por defecto como preparados siempre
  }
  emit('update:modelValue', [...props.modelValue, nuevoHechizo])
}

const eliminarHechizo = (id) => {
  const listaActualizada = props.modelValue.filter(h => h.id !== id)
  emit('update:modelValue', listaActualizada)
  if (tooltipActivoId.value === id) tooltipActivoId.value = null
}

const togglePreparado = (id) => {
  const listaActualizada = props.modelValue.map(h => {
    if (h.id === id) {
      return { ...h, preparado: !h.preparado }
    }
    return h
  })
  emit('update:modelValue', listaActualizada)
}

// === Lógica de Datos Extendidos (Tooltips) ===

const obtenerInfoCompleta = (id) => {
  return listaHechizos.find(h => h.id === id)
}

const toggleTooltip = (id) => {
  tooltipActivoId.value = tooltipActivoId.value === id ? null : id
}

const cerrarTooltip = (id) => {
  if (tooltipActivoId.value === id) {
    tooltipActivoId.value = null
  }
}

// Directiva personalizada para cerrar tooltips al hacer click fuera
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
.spells-section {
  padding: 1.5rem;
  background: var(--color-surface, #ffffff);
  border-radius: var(--border-radius, 4px);
  margin-bottom: 1rem;
}
.section-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-title {
  margin: 0;
  color: var(--color-primary, #7b1fa2);
}

.empty-state {
  color: #757575;
  font-style: italic;
  width: 100%;
}

/* Contenedor adaptativo en formato Fila-Horizontal */
.spells-grid-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

/* Tarjetas de Nivel (Se expanden horizontalmente si hay espacio) */
.spell-level-card {
  flex: 1 1 1;
  min-width: 280px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.level-title {
  margin: 0 0 1rem 0;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid var(--color-primary-light, #ae52d4);
  color: var(--color-text, #212121);
}

/* Listado de Hechizos */
.spell-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.spell-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: var(--color-background, #f5f0e8);
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  gap: 0.5rem;
}
.spell-prepared-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
.spell-cantrip-spacer {
  width: 16px;
}
.spell-name {
  flex: 1;
  font-size: 0.95rem;
  color: #757575;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.spell-name.is-prepared {
  color: #212121;
  font-weight: 500;
}

/* Acciones e interactivos */
.spell-actions {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}
.btn-info {
  background: var(--color-primary-light, #ae52d4);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.btn-info:hover {
  background: var(--color-primary, #7b1fa2);
}
.btn-remove {
  background: transparent;
  color: #f44336;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
  padding: 0 0.25rem;
}
.btn-remove:hover {
  color: #d32f2f;
}
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
}

/* Estilos de Tooltips Flotantes */
.tooltip-container {
  position: relative;
}
.spell-tooltip {
  position: absolute;
  bottom: 125%;
  right: 0;
  z-index: 100;
  width: 280px;
  max-height: 300px;
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 0.85rem;
  overflow-y: auto;
  text-align: left;
}
.spell-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  right: 5px;
  border-width: 6px;
  border-style: solid;
  border-color: #2c3e50 transparent transparent transparent;
}
.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tooltip-header h5 {
  margin: 0;
  font-size: 1rem;
  color: #f1c40f;
}
.tooltip-badge {
  font-size: 0.75rem;
  background: #34495e;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}
.spell-tooltip hr {
  border: 0;
  border-top: 1px solid #34495e;
  margin: 0.5rem 0;
}
.spell-tooltip p {
  margin: 0.25rem 0;
}
.tooltip-description {
  margin-top: 0.5rem !important;
  color: #bdc3c7;
  line-height: 1.3;
  font-style: italic;
}

/* --- ESTILOS DEL MODAL --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #ffffff;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}
.modal-header h3 {
  margin: 0;
  color: var(--color-primary, #7b1fa2);
}
.btn-close-modal {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #757575;
}
.btn-close-modal:hover {
  color: #212121;
}
.modal-controls {
  padding: 1rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
}
.search-input {
  flex: 1 1 200px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95rem;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #424242;
  cursor: pointer;
}
.table-container {
  overflow-y: auto;
  padding: 0 1.5rem 1.5rem 1.5rem;
}
.spells-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.spells-table th, .spells-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}
.spells-table th {
  background: #f5f5f5;
  color: #424242;
  position: sticky;
  top: 0;
  z-index: 10;
}
.sortable-header {
  cursor: pointer;
  user-select: none;
}
.sortable-header:hover {
  background: #e0e0e0;
}
.sort-icon {
  font-size: 0.75rem;
  margin-left: 0.25rem;
}
.action-cell {
  text-align: right;
}
.empty-table {
  color: #757575;
  font-style: italic;
  padding: 2rem !important;
}
</style>