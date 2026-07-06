<template>
  <div class="home-view">
    <header class="home-view__header">
      <h1><img src="/public/gremio-home-icon.svg" alt="Logo del gremio" class="logo"> Gremio de Égida</h1>
      <div class="home-view__global-actions">
        <BaseButton variant="secondary" @click="exportarDatos">
          Exportar Lista
        </BaseButton>
        <label class="custom-file-upload">
          Importar Ficha
          <input type="file" accept=".json" @change="importarDatos" />
        </label>
        <BaseButton variant="primary" @click="crearNuevoPersonaje">
          Nuevo Personaje
        </BaseButton>
      </div>
    </header>

    <SearchBar 
      v-model="filtroTexto"
      v-model:claseFiltro="filtroClase"
      :clases="clasesDisponibles"
    />

    <div v-if="personajesFiltrados.length === 0" class="home-view__empty">
      <p>No se encontraron aventureros en los registros. ¡Crea un nuevo personaje o importa un archivo válido!</p>
    </div>

    <div v-else class="home-view__grid">
      <CharacterCard 
        v-for="personaje in personajesFiltrados" 
        :key="personaje.id" 
        :personaje="personaje"
        @editar="irAEdicion"
        @eliminar="manejadorEliminar"
      />
    </div>
  </div>

  <div v-if="mostrarModalConflicto && conflictoActual" class="modal-overlay">
      <div class="modal-content conflict-modal">
        <h3 class="conflict-title">Personaje Existente Detectado</h3>
        
        <p class="conflict-message">
          El archivo contiene un personaje cuyo identificador ya existe en tu gremio. ¿Qué deseas hacer con este aventurero?
        </p>

        <div class="conflict-details">
          <h4>
            {{ conflictoActual.nombre }} 
            <span class="total-level">(Nivel {{ calcularNivelTotal(conflictoActual.clases) }})</span>
          </h4>
          <ul class="class-list">
            <li v-for="(clase, index) in conflictoActual.clases" :key="index">
              <strong>{{ clase.nombre }}</strong> (Nivel {{ clase.nivel }})
              <span v-if="clase.subclase"> - {{ clase.subclase }}</span>
            </li>
          </ul>
        </div>

        <div class="conflict-options">
          <label class="apply-all-label">
            <input type="checkbox" v-model="aplicarATodos" />
            Aplicar esta decisión a todos los conflictos de esta importación
          </label>
        </div>

        <div class="conflict-actions">
          <button class="btn-conflict btn-omit" @click="resolverConflicto('omitir')">
            Omitir
          </button>
          <button class="btn-conflict btn-duplicate" @click="resolverConflicto('duplicar')">
            Duplicar (Copiar)
          </button>
          <button class="btn-conflict btn-overwrite" @click="resolverConflicto('sobreescribir')">
            Sobreescribir
          </button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/useCharacterStore'
import { useDataStore } from '../stores/useDataStore'
import BaseButton from '../components/common/BaseButton.vue'
import SearchBar from '../components/character/SearchBar.vue'
import CharacterCard from '../components/character/CharacterCard.vue'

const router = useRouter()
const characterStore = useCharacterStore()
const dataStore = useDataStore()

const filtroTexto = ref('')
const filtroClase = ref('')

// === ESTADO Y LÓGICA DE CONFLICTOS DE IMPORTACIÓN ===
const mostrarModalConflicto = ref(false)
const colaConflictos = ref([])
const personajesNuevosPendientes = ref([])
const resoluciones = ref([])
const aplicarATodos = ref(false)

const conflictoActual = computed(() => colaConflictos.value[0])

const calcularNivelTotal = (clases) => {
  if (!clases || clases.length === 0) return 1
  return clases.reduce((total, c) => total + (c.nivel || 1), 0)
}

const resolverConflicto = (decision) => {
  if (aplicarATodos.value) {
    // Aplica la misma decisión a toda la cola restante
    colaConflictos.value.forEach(personaje => {
      resoluciones.value.push({ personaje, decision })
    })
    colaConflictos.value = []
  } else {
    // Aplica la decisión solo al personaje actual y avanza
    resoluciones.value.push({ personaje: conflictoActual.value, decision })
    colaConflictos.value.shift()
  }

  // Si se vacía la cola, ejecutamos la importación final
  if (colaConflictos.value.length === 0) {
    mostrarModalConflicto.value = false
    characterStore.procesarImportacionFinal(personajesNuevosPendientes.value, resoluciones.value)
    alert('Ficha(s) procesada(s) e importada(s) con éxito.')
    
    // Reseteo de estados
    personajesNuevosPendientes.value = []
    resoluciones.value = []
    aplicarATodos.value = false
  }
}
// =====================================================

onMounted(async () => {
  if (!dataStore.gameData) {
    await dataStore.fetchAllData()
  }
})

const clasesDisponibles = computed(() => {
  if (dataStore.getClasses && dataStore.getClasses.length > 0) {
    return dataStore.getClasses.map(c => c.nombre)
  }
  return ['Guerrero', 'Mago', 'Clérigo', 'Pícaro', 'Paladín', 'Bardo', 'Explorador', 'Druida', 'Brujo', 'Hechicero', 'Bárbaro', 'Monje']
})

const personajesFiltrados = computed(() => {
  return characterStore.personajes.filter(p => {
    const coincideTexto = p.nombre.toLowerCase().includes(filtroTexto.value.toLowerCase())
    
    const coincideClase = !filtroClase.value || 
      (p.clases && p.clases.some(c => c.nombre === filtroClase.value))
      
    return coincideTexto && coincideClase
  })
})

const irAEdicion = (id) => {
  router.push({ name: 'edit-character', params: { id } })
}

const crearNuevoPersonaje = () => {
  router.push({ name: 'create-character' })
}

const manejadorEliminar = (id) => {
  if (confirm('¿Seguro que deseas eliminar este personaje del gremio? Esta acción es irreversible.')) {
    characterStore.eliminarPersonaje(id)
  }
}

const exportarDatos = () => {
  characterStore.exportarPersonajes()
}

const importarDatos = async (event) => {
  const archivo = event.target.files[0]
  if (!archivo) return
  
  try {
    // Ahora el store nos devuelve dos arreglos separados
    const { nuevos, duplicados } = await characterStore.importarPersonajes(archivo)
    
    if (duplicados && duplicados.length > 0) {
      // Llenamos la cola y abrimos el modal
      personajesNuevosPendientes.value = nuevos
      colaConflictos.value = duplicados
      resoluciones.value = []
      aplicarATodos.value = false
      mostrarModalConflicto.value = true
    } else {
      // Si no hay duplicados, guardamos directamente
      characterStore.procesarImportacionFinal(nuevos, [])
      alert('Ficha(s) procesada(s) e importada(s) con éxito.')
    }
  } catch (err) {
    alert('Error crítico: El archivo seleccionado no cuenta con un esquema estructural JSON de personaje válido.')
  } finally {
    event.target.value = '' // Resetea el elemento de entrada de archivos
  }
}
</script>

<style scoped>
.home-view {
  padding: 2rem;
  margin: 0 auto;
}
@media (min-width: 1024px){
  .home-view {
    max-width: 95vw;
  }
}
.home-view__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}
.home-view__header h1 {
  margin: 0;
  font-size: 2.2rem;
  color: var(--color-primary, #7b1fa2);
}
.home-view__global-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.custom-file-upload {
  display: inline-block;
  padding: 0.5rem 1rem;
  font-weight: bold;
  border-radius: var(--border-radius, 4px);
  background-color: var(--color-surface-alt, #e8e0d0);
  color: var(--color-text, #212121);
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}
.custom-file-upload:hover {
  opacity: 0.9;
}
.custom-file-upload input[type="file"] {
  display: none;
}
.home-view__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
.home-view__empty {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--color-surface, #fff);
  border-radius: var(--border-radius, 4px);
  border: 2px dashed #ccc;
  color: #666;
}
/* =========================================
   MODAL DE CONFLICTOS DE IMPORTACIÓN
   ========================================= */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.conflict-modal {
  background: var(--color-surface, #ffffff);
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  padding: 1.5rem 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.conflict-title {
  color: #d32f2f; /* Rojo/Alerta sutil */
  margin-top: 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.conflict-message {
  font-size: 0.95rem;
  color: #444;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.conflict-details {
  background: #f5f5f5;
  border-left: 4px solid var(--color-primary, #7b1fa2);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.conflict-details h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #222;
}

.total-level {
  font-weight: normal;
  color: #666;
  font-size: 0.9rem;
}

.class-list {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.9rem;
  color: #333;
}

.class-list li {
  margin-bottom: 0.25rem;
}

.class-list li:last-child {
  margin-bottom: 0;
}

.conflict-options {
  margin-bottom: 1.5rem;
}

.apply-all-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  cursor: pointer;
  color: #555;
}

.apply-all-label input[type="checkbox"] {
  accent-color: var(--color-primary, #7b1fa2);
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* Botones de acción del modal */
.conflict-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-conflict {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: filter 0.2s, transform 0.1s;
}

.btn-conflict:hover {
  filter: brightness(0.9);
}

.btn-conflict:active {
  transform: scale(0.97);
}

.btn-omit {
  background-color: #e0e0e0;
  color: #333;
}

.btn-duplicate {
  background-color: var(--color-primary, #7b1fa2);
  color: white;
}

.btn-overwrite {
  background-color: #d32f2f;
  color: white;
}
.logo{
  height: 2rem;
}
</style>