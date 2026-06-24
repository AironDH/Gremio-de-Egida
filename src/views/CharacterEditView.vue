<template>
  <div class="view-container">
    <CharacterForm 
      v-if="personajeAEditar"
      :personajeInicial="personajeAEditar"
      @guardar="procesarActualizacion" 
      @cancelar="volverAlInicio" 
    />
    <div v-else class="error-msg">
      <h2>Personaje no encontrado</h2>
      <button @click="volverAlInicio">Volver a la lista</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/useCharacterStore'
import CharacterForm from '../components/character/CharacterForm.vue'

// Recibe el 'id' como prop gracias a props: true en el router
const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const router = useRouter()
const characterStore = useCharacterStore()

// Busca el personaje en el store reactivamente
const personajeAEditar = computed(() => {
  return characterStore.personajes.find(p => p.id === props.id)
})

const procesarActualizacion = (datosPersonaje) => {
  // Pasa los datos actualizados, asegurando que el id se mantiene intacto
  characterStore.actualizarPersonaje({
    ...datosPersonaje,
    id: props.id
  })
  volverAlInicio()
}

const volverAlInicio = () => {
  router.push({ name: 'home' })
}
</script>

<style scoped>
.view-container {
  padding: 2rem;
  margin: 0 auto;
}
@media (min-width: 1024px){
  .view-container {
    max-width: 95vw;
  }
}
</style>