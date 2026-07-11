<template>
  <div class="home-view">
    <header class="home-view__header">
      <h1><img src="/public/gremio-home-icon.svg" alt="Logo del gremio" class="logo"> Gremio de Égida</h1>
      
      <div class="home-view__global-actions">
        <!-- Acciones Locales -->
        <div class="action-group">
          <BaseButton variant="secondary" @click="exportarDatos">
            Exportar Local
          </BaseButton>
          <label class="custom-file-upload">
            Importar Local
            <input type="file" accept=".json" @change="importarDatos" />
          </label>
        </div>

        <div class="action-divider"></div>

        <!-- Acciones en la Nube (Google Drive) -->
        <div class="action-group cloud-group">
          <!-- Estado: No Autenticado -->
          <button 
            v-if="!googleStore.usuarioAutenticado" 
            class="btn-cloud btn-cloud--connect" 
            @click="googleStore.iniciarSesion"
          >
            Conectar Drive
          </button>
          
          <!-- Estado: Autenticado -->
          <template v-else>
            <button 
              class="btn-cloud btn-cloud--action" 
              @click="manejadorGuardarNube" 
              :disabled="cargandoNube"
            >
              {{ cargandoNube ? 'Guardando...' : 'Guardar en Nube' }}
            </button>
            <button 
              class="btn-cloud btn-cloud--action" 
              @click="manejadorCargarNube" 
              :disabled="cargandoNube"
            >
              {{ cargandoNube ? 'Cargando...' : 'Cargar desde Nube' }}
            </button>
            <button 
              class="btn-cloud btn-cloud--disconnect" 
              @click="googleStore.cerrarSesion" 
              title="Cerrar sesión de Google Drive"
              :disabled="cargandoNube"
            >
              ✕
            </button>
          </template>
        </div>

        <div class="action-divider"></div>

        <!-- Nueva Acción -->
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
import { useGoogleDriveStore } from '../stores/useGoogleDriveStore'
import BaseButton from '../components/common/BaseButton.vue'
import SearchBar from '../components/character/SearchBar.vue'
import CharacterCard from '../components/character/CharacterCard.vue'

const router = useRouter()
const characterStore = useCharacterStore()
const dataStore = useDataStore()
const googleStore = useGoogleDriveStore()

const filtroTexto = ref('')
const filtroClase = ref('')

// === ESTADO Y LÓGICA DE CONFLICTOS DE IMPORTACIÓN ===
const mostrarModalConflicto = ref(false)
const colaConflictos = ref([])
const personajesNuevosPendientes = ref([])
const resoluciones = ref([])
const aplicarATodos = ref(false)

// Estado de carga para bloquear UI durante peticiones a Google
const cargandoNube = ref(false)

const conflictoActual = computed(() => colaConflictos.value[0])

const calcularNivelTotal = (clases) => {
  if (!clases || clases.length === 0) return 1
  return clases.reduce((total, c) => total + (c.nivel || 1), 0)
}

const resolverConflicto = (decision) => {
  if (aplicarATodos.value) {
    colaConflictos.value.forEach(personaje => {
      resoluciones.value.push({ personaje, decision })
    })
    colaConflictos.value = []
  } else {
    resoluciones.value.push({ personaje: conflictoActual.value, decision })
    colaConflictos.value.shift()
  }

  if (colaConflictos.value.length === 0) {
    mostrarModalConflicto.value = false
    characterStore.procesarImportacionFinal(personajesNuevosPendientes.value, resoluciones.value)
    alert('Ficha(s) procesada(s) e importada(s) con éxito.')
    
    personajesNuevosPendientes.value = []
    resoluciones.value = []
    aplicarATodos.value = false
  }
}
// =====================================================

onMounted(async () => {
  // Inicializamos las APIs de Google apenas la vista de inicio cargue
  await googleStore.inicializarGoogle()

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

// === ACCIONES LOCALES ===
const exportarDatos = () => {
  characterStore.exportarPersonajes()
}

const importarDatos = async (event) => {
  const archivo = event.target.files[0]
  if (!archivo) return
  
  try {
    const { nuevos, duplicados } = await characterStore.importarPersonajes(archivo)
    
    if (duplicados && duplicados.length > 0) {
      personajesNuevosPendientes.value = nuevos
      colaConflictos.value = duplicados
      resoluciones.value = []
      aplicarATodos.value = false
      mostrarModalConflicto.value = true
    } else {
      characterStore.procesarImportacionFinal(nuevos, [])
      alert('Ficha(s) procesada(s) e importada(s) con éxito.')
    }
  } catch (err) {
    alert('Error crítico: El archivo seleccionado no cuenta con un esquema estructural JSON de personaje válido.')
  } finally {
    event.target.value = ''
  }
}

// === ACCIONES EN LA NUBE (GOOGLE DRIVE) ===
const manejadorGuardarNube = async () => {
  if (characterStore.personajes.length === 0) {
    return alert('No hay personajes en el gremio para guardar en la nube.');
  }

  cargandoNube.value = true;
  try {
    await googleStore.guardarEnNube(characterStore.personajes);
    alert('¡Respaldo sincronizado exitosamente en Google Drive!');
  } catch (error) {
    alert('Ocurrió un problema al guardar en la nube: ' + (error.message || 'Revisa tu conexión o permisos.'));
  } finally {
    cargandoNube.value = false;
  }
}

const manejadorCargarNube = async () => {
  cargandoNube.value = true;
  try {
    const datosJson = await googleStore.cargarDesdeNube();
    
    // Transformamos el JSON devuelto en un Blob para inyectarlo en el FileReader existente
    const archivoVirtual = new Blob([JSON.stringify(datosJson)], { type: 'application/json' });
    
    // Lo procesamos exactamente igual que si el usuario hubiera seleccionado un archivo local
    const { nuevos, duplicados } = await characterStore.importarPersonajes(archivoVirtual);
    
    if (duplicados && duplicados.length > 0) {
      personajesNuevosPendientes.value = nuevos;
      colaConflictos.value = duplicados;
      resoluciones.value = [];
      aplicarATodos.value = false;
      mostrarModalConflicto.value = true;
    } else {
      characterStore.procesarImportacionFinal(nuevos, []);
      alert('Fichas recuperadas desde Google Drive con éxito.');
    }
  } catch (error) {
    alert('Error al recuperar datos: ' + (error.message || 'No se encontró un archivo de respaldo o la conexión falló.'));
  } finally {
    cargandoNube.value = false;
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
  width: 4rem;
}

/* =========================================
   GRUPOS DE ACCIONES Y SEPARADORES
   ========================================= */
.action-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.action-divider {
  width: 2px;
  height: 28px;
  background-color: #e0e0e0;
  margin: 0 0.25rem;
}

/* =========================================
   BOTONES DE GOOGLE DRIVE (NUBE)
   ========================================= */
.cloud-group {
  background-color: #f4f8ff;
  padding: 0.4rem 0.6rem;
  border-radius: var(--border-radius, 4px);
  border: 1px solid #cce3ff;
}

.btn-cloud {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-weight: bold;
  border-radius: var(--border-radius, 4px);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  border: none;
}

.btn-cloud:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cloud--connect {
  background-color: #ffffff;
  color: #1a73e8; /* Azul estilo Google */
  border: 1px solid #1a73e8;
}

.btn-cloud--connect:hover {
  background-color: #e8f0fe;
}

.btn-cloud--action {
  background-color: #1a73e8;
  color: #ffffff;
  border: 1px solid #1a73e8;
}

.btn-cloud--action:hover:not(:disabled) {
  background-color: #1557b0;
  border-color: #1557b0;
}

.btn-cloud--disconnect {
  background-color: transparent;
  color: #5f6368;
  padding: 0.5rem;
  border-radius: 50%;
  font-size: 1.1rem;
  line-height: 1;
}

.btn-cloud--disconnect:hover:not(:disabled) {
  background-color: #e8eaed;
  color: #d32f2f;
}
</style>