<template>
  <form @submit.prevent="guardarPersonaje" class="character-form">
    <div class="character-form__header">
      <h2>{{ esEdicion ? 'Editar Personaje' : 'Nuevo Personaje' }}</h2>
      <div class="actions">
        <BaseButton variant="secondary" type="button" @click="$emit('cancelar')">Cancelar</BaseButton>
        <BaseButton variant="primary" type="submit">Guardar</BaseButton>
      </div>
    </div>

    <!-- Sección 1: Datos Generales y PG -->
    <CharacterBasicInfo v-model="formData" />

    <!-- Sección 2: Características -->
    <CharacterStats v-model="formData.caracteristicasBase" />

    <!-- Sección 3: Ataques y Trucos -->
    <CharacterAttacks v-model="formData.ataques" />

    <!-- Sección 4: Equipo -->
    <CharacterEquipment v-model="formData.equipo" />

    <!-- Sección 5: Personalidad -->
    <CharacterPersonality v-model="formData.personalidad" />

  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseButton from '../common/BaseButton.vue'
import CharacterBasicInfo from './CharacterBasicInfo.vue'
import CharacterStats from './CharacterStats.vue'
import CharacterEquipment from './CharacterEquipment.vue'
import CharacterPersonality from './CharacterPersonality.vue'
import CharacterAttacks from './CharacterAttacks.vue'

const props = defineProps({
  personajeInicial: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['guardar', 'cancelar'])

const esEdicion = ref(false)
const formData = ref({
  nombre: '',
  clase: '',
  especie: '',
  nivel: 1,
  puntosVidaMax: 10,
  puntosVidaActuales: 10,
  caracteristicasBase: { 
    fuerza: 10, 
    destreza: 10, 
    constitucion: 10, 
    inteligencia: 10, 
    sabiduria: 10, 
    carisma: 10 
  },
  ataques: [],
  equipo: [],
  personalidad: { 
    rasgosPersonalidad: '', 
    ideales: '', 
    vinculos: '', 
    defectos: '', 
    apariencia: '', 
    historia: '' 
  }
})

onMounted(() => {
  if (props.personajeInicial) {
    esEdicion.value = true
    formData.value = JSON.parse(JSON.stringify(props.personajeInicial))
  }
})

const guardarPersonaje = () => {
  emit('guardar', formData.value)
}
</script>

<style scoped>
.character-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.character-form__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--color-primary-light, #ae52d4);
}
.character-form__header h2 {
  margin: 0;
  color: var(--color-primary, #7b1fa2);
}
.actions {
  display: flex;
  gap: 1rem;
}
</style>