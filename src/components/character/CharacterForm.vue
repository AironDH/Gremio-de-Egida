<template>
  <form @submit.prevent="guardarPersonaje" class="character-form">
    <div class="character-form__header">
      <h2>{{ esEdicion ? 'Editar Personaje' : 'Nuevo Personaje' }}</h2>
      <div class="actions">
        <BaseButton variant="secondary" type="button" @click="$emit('cancelar')">Cancelar</BaseButton>
        <BaseButton variant="primary" type="submit">Guardar</BaseButton>
      </div>
    </div>

    <!-- Sección 1: Datos Generales -->
    <CharacterBasicInfo v-model="formData" />
    <CharacterFeatures 
      v-model:ca="formData.ca" 
      v-model:velocidad="formData.velocidad" 
      :combateCalculado="combateCalculado" 
    />

    <!-- Sección 2: Características -->
    <CharacterStats 
      v-model:caracteristicas="formData.caracteristicasBase" 
      v-model:salvaciones="formData.salvaciones"
      :salvacionesCalculadas="salvacionesCalculadas"
    />

    <!-- Sección 3: Habilidades -->
    <CharacterSkills 
      v-model="formData.habilidades" 
      :habilidadesCalculadas="habilidadesCalculadas" 
    />

    <!-- Sección 4: Ataques y Trucos -->
    <CharacterAttacks v-model="formData.ataques" />

    <!-- Sección 5: Equipo -->
    <CharacterEquipment v-model="formData.equipo" />

    <!-- Sección 6: Personalidad -->
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
import CharacterSkills from './CharacterSkills.vue'
import CharacterFeatures from './CharacterFeatures.vue'
import { useCharacterCalculations } from '../../composables/useCharacterCalculations.js'


const props = defineProps({
  personajeInicial: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['guardar', 'cancelar'])

const esEdicion = ref(false)
const formData = ref({
    id: '',
    nombre: '',
    clases: [
        { nombre: '', nivel: 1, subclase: '' } // <-- Estructura multiclase 
    ],
    especie: '',
    raza: '',
    puntosVidaMax: 10,
    puntosVidaActuales: 10,
    pgTemp: 0,
    caracteristicasBase: { 
        fuerza: 10, 
        destreza: 10, 
        constitucion: 10, 
        inteligencia: 10, 
        sabiduria: 10, 
        carisma: 10 
    },
    salvaciones: { 
        fuerza: false, 
        destreza: false, 
        constitucion: false, 
        inteligencia: false, 
        sabiduria: false, 
        carisma: false 
    },
    habilidades: { 
        atletismo: 'sin_competencia', 
        acrobacias: 'sin_competencia', 
        juego_de_manos: 'sin_competencia', 
        sigilo: 'sin_competencia', 
        conocimiento_arcano: 'sin_competencia', 
        historia: 'sin_competencia', 
        investigacion: 'sin_competencia', 
        naturaleza: 'sin_competencia', 
        religion: 'sin_competencia', 
        trato_con_animales: 'sin_competencia', 
        medicina: 'sin_competencia', 
        percepcion: 'sin_competencia', 
        perspicacia: 'sin_competencia', 
        supervivencia: 'sin_competencia', 
        intimidacion: 'sin_competencia', 
        interpretacion: 'sin_competencia', 
        persuasion: 'sin_competencia', 
        engano: 'sin_competencia' 
    },
    ca: 10,
  velocidad: 30,
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

// Instanciamos el motor de cálculos pasándole el estado completo del formulario
const { salvacionesCalculadas, habilidadesCalculadas, combateCalculado } = useCharacterCalculations(formData)

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