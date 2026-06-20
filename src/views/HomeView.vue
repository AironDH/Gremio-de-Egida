<template>
  <div class="home-view">
    <header class="home-view__header">
      <h1>Gremio de Égida</h1>
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

onMounted(async () => {
  // Asegura la existencia de datos estáticos en el sistema para popular los filtros
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
    
    // Evalúa si la clase seleccionada en el filtro existe dentro del arreglo de clases del personaje
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
    await characterStore.importarPersonajes(archivo)
    alert('Ficha(s) procesada(s) e importada(s) con éxito.')
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
  max-width: 1200px;
  margin: 0 auto;
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
</style>