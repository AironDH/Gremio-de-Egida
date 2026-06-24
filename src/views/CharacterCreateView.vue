<template>
  <div class="view-container">
    <CharacterForm 
      @guardar="procesarGuardado" 
      @cancelar="volverAlInicio" 
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import { useCharacterStore } from '../stores/useCharacterStore'
import CharacterForm from '../components/character/CharacterForm.vue'

const router = useRouter()
const characterStore = useCharacterStore()

const procesarGuardado = (datosPersonaje) => {
  const nuevoPersonaje = {
    ...datosPersonaje,
    id: uuidv4()
  }
  
  // Guardamos en el store, lo cual también actualiza el LocalStorage
  characterStore.personajes.push(nuevoPersonaje)
  characterStore.guardarEnLocalStorage()
  
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
.error-msg {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>