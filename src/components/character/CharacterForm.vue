<template>
  <form @submit.prevent="guardarPersonaje" class="character-form" ref="formRef">
    <div class="character-form__header ancho-total">
      <h2>{{ esEdicion ? 'Editar Personaje' : 'Nuevo Personaje' }}</h2>
      <div class="actions">
        <BaseButton variant="secondary" type="button" @click="$emit('cancelar')">Cancelar</BaseButton>
        <BaseButton variant="primary" type="submit">Guardar</BaseButton>
      </div>
    </div>


    <CharacterBasicInfo v-model="formData" class="ancho-medio"/>

    <CharacterFeatures 
      v-model:ca="formData.ca" 
      v-model:velocidad="formData.velocidad" 
      v-model:modificadoresIniciativa="formData.modificadoresIniciativa"
      :combateCalculado="combateCalculado" 
      class="ancho-medio"
    />

    <CharacterStats 
      v-model:caracteristicas="formData.caracteristicasBase" 
      v-model:salvaciones="formData.salvaciones"
      :salvacionesCalculadas="salvacionesCalculadas"
      :salvacionesClasePrincipal="salvacionesClasePrincipal" 
      class="ancho-medio"
    />

    <CharacterSkills 
      v-model="formData.habilidades" 
      :habilidadesCalculadas="habilidadesCalculadas" 
      class="ancho-medio"
    />

    <CharacterHealth 
      v-model:vidaMaxima="formData.puntosVidaMax"
      v-model:vidaActual="formData.puntosVidaActuales"
      v-model:vidaTemporal="formData.pgTemp"
      v-model:dadosGolpeActuales="formData.dadosGolpeActuales"
      v-model:estadosFijos="formData.estadosFijos"
      v-model:estadoPersonalizado="formData.estadoPersonalizado"
      :dadosGolpeMaximos="dadosGolpeMaximos"
      class="ancho-medio"
    />

    <CharacterResources 
      v-model="formData"
      :espaciosEstandarMax="espaciosEstandar"
      :espaciosPactoMax="espaciosPacto"
      @reset-estandar="resetearMagiaEstandar"
      @reset-pacto="resetearMagiaPacto"
      @reset-personalizados="resetearRecursosPersonalizados"
      class="ancho-medio"
    />

    <CharacterAttacks v-model="formData.ataques" class="ancho-medio" />

    <CharacterEquipment 
      v-model="formData.equipo" 
      :pesoActualEquipado="pesoActualEquipado"
      :capacidadCargaCalculada="capacidadCargaCalculada"
      class="ancho-medio"
    />

    <!-- Libro de Hechizos -->
    <CharacterSpells 
      v-model="formData.hechizos" 
      :clasesPersonaje="formData.clases"
      class="ancho-total"
    />

    <CharacterTraits 
      :rasgos="rasgosPersonaje" 
      :clasesPersonaje="formData.clases" 
      class="columna-1"
    />

    <CharacterPersonality v-model="formData.personalidad" class="ancho-3"/>

  </form>

  <LevelUpAlert 
    :requiereMejora="requiereMejora"
    :claseTrigger="claseTrigger"
    :cantidadMejoras="cantidadMejorasPendientes"
    @abrir-modal="mostrarModalMejora = true"
    class="alerta"
  />

  <LevelUpModal 
    :mostrar="mostrarModalMejora"
    :claseOrigen="claseTrigger"
    :nivelOrigen="nivelTrigger"
    :tipoFiltro="tipoFiltroDote"
    @cerrar="mostrarModalMejora = false"
    @guardar-mejora="registrarDote"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import BaseButton from '../common/BaseButton.vue'
import CharacterBasicInfo from './CharacterBasicInfo.vue'
import CharacterHealth from './CharacterHealth.vue'
import CharacterStats from './CharacterStats.vue'
import CharacterEquipment from './CharacterEquipment.vue'
import CharacterPersonality from './CharacterPersonality.vue'
import CharacterAttacks from './CharacterAttacks.vue'
import CharacterSkills from './CharacterSkills.vue'
import CharacterFeatures from './CharacterFeatures.vue'
import CharacterResources from './CharacterResources.vue'
import CharacterSpells from './CharacterSpells.vue' // <-- IMPORTADO
import { useCharacterCalculations } from '../../composables/useCharacterCalculations.js'
import LevelUpAlert from './LevelUpAlert.vue'
import LevelUpModal from './LevelUpModal.vue'
import CharacterTraits from './CharacterTraits.vue'

// Importaciones de datos estáticos y composables
import datosMundo from '../../data/data.json'
import espaciosConjuroData from '../../data/espacios-conjuro.json'
import { useLevelUp } from '../../composables/useLevelUp.js'
import { useSpellcasting } from '../../composables/useSpellcasting.js'

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
        { nombre: '', nivel: 1, subclase: '' } 
    ],
    especie: '',
    raza: '',
    trasfondo: '',
    tamano: 'mediano',
    puntosVidaMax: 10,
    puntosVidaActuales: 10,
    pgTemp: 0,
    dadosGolpeActuales: {},
    ca: 10,
    velocidad: 9,
    estadoPersonalizado: "",
    estadosFijos: [],
    modificadoresIniciativa: [],
    dotes: [],
    ataques: [],
    hechizos: [], // <-- NUEVO ESTADO INICIAL
    equipo: [
      {
        "id": "c8be5d5a-51eb-4adb-b11c-42217d0e6c10",
        "nombre": "Piezas de Oro",
        "cantidad": 0,
        "peso": 0.01,
        "notas": ""
      }
    ],
    mejoras: [],

    recursosMagicos: {
      estandar: {}, // Guardará los slots actuales de la forma { "1": 4, "2": 2 }
      pacto: {}     // Guardará los slots actuales de pacto de la forma { "slots": 2, "slot_level": 1 }
    },
    recursosPersonalizados: [], // Array de objetos { nombre, actual, maximo }

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
    personalidad: { 
        rasgosPersonalidad: '', 
        ideales: '', 
        vinculos: '', 
        defectos: '', 
        apariencia: '', 
        historia: '' 
    }
})

// Inicializamos el motor de niveles y dotes
const { 
    rasgosPersonaje,
    requiereMejora,
    cantidadMejorasPendientes,
    claseTrigger,
    nivelTrigger,
    tipoFiltroDote 
} = useLevelUp(formData, datosMundo)

// Inicializamos el motor mágico
const { espaciosEstandar, espaciosPacto } = useSpellcasting(formData, datosMundo, espaciosConjuroData)

// ==========================================
// FUNCIONES DE RESETEO (DESCANSOS)
// ==========================================

// Descanso Largo: Recupera todos los espacios estándar copiando los valores máximos calculados
const resetearMagiaEstandar = () => {
  formData.value.recursosMagicos.estandar = { ...espaciosEstandar.value }
}

// Descanso Corto/Largo: Recupera los espacios de pacto copiando el valor máximo calculado
const resetearMagiaPacto = () => {
  formData.value.recursosMagicos.pacto = { ...espaciosPacto.value }
}

// Descanso Largo/Corto: Iguala el valor actual de todos los recursos customizados a su valor máximo
const resetearRecursosPersonalizados = () => {
  if (Array.isArray(formData.value.recursosPersonalizados)) {
    formData.value.recursosPersonalizados.forEach(recurso => {
      recurso.actual = recurso.maximo
    })
  }
}

// ==========================================
// LÓGICA DE MODALS Y CÁLCULOS
// ==========================================

const mostrarModalMejora = ref(false)

const registrarDote = (nuevaDote) => {
  if (!formData.value.dotes) formData.value.dotes = []
  formData.value.dotes.push(nuevaDote)
  mostrarModalMejora.value = false
}

const registrarMejora = (nuevaMejora) => {
  formData.value.mejoras.push(nuevaMejora)
  mostrarModalMejora.value = false 
}

const { 
  salvacionesCalculadas, 
  habilidadesCalculadas, 
  combateCalculado,
  capacidadCargaCalculada,
  pesoActualEquipado,
  salvacionesClasePrincipal,
  dadosGolpeMaximos 
      } = useCharacterCalculations(formData)

onMounted(() => {
  if (props.personajeInicial) {
    esEdicion.value = true
    formData.value = JSON.parse(JSON.stringify(props.personajeInicial))
  }
})

const guardarPersonaje = () => {
  emit('guardar', formData.value)
}

/* ----------------------------
      Script para cambiar el tamaño de los elementos de forma dinámica
      ----------------------------
*/

const formRef = ref(null);
let resizeObserver = null;
let mutationObserver = null;

const recalcularElemento = (el) => {
  if (!el || el.classList.contains('character-form__header')) return;

  const altoFila = 10;       
  const espacioGutter = 10;  

  el.style.setProperty('grid-row-end', 'auto', 'important');
  const alturaContenido = el.getBoundingClientRect().height;
  
  const filasNecesarias = Math.ceil((alturaContenido + espacioGutter) / (altoFila + espacioGutter));
  
  el.style.setProperty('grid-row-end', `span ${filasNecesarias}`, 'important');
};

onMounted(async () => {
  await nextTick();

  resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      recalcularElemento(entry.target);
    }
  });

  const observarHijo = (hijo) => {
    if (hijo && !hijo.classList.contains('character-form__header')) {
      resizeObserver.observe(hijo);
      recalcularElemento(hijo);
    }
  };

  if (formRef.value) {
    const hijosIniciales = formRef.value.children;
    for (let hijo of hijosIniciales) {
      observarHijo(hijo);
    }

    mutationObserver = new MutationObserver((mutations) => {
      for (let mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((nodo) => {
            if (nodo.nodeType === 1) {
              observarHijo(nodo);
            }
          });
        }
      }
    });

    mutationObserver.observe(formRef.value, { childList: true });
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect();
  if (mutationObserver) mutationObserver.disconnect();
});
</script>

<style scoped>
.character-form {
  display: flex;
  flex-direction: column;
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
.alerta{
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  text-align: center;
  padding: 10px 2rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); 
}

/* 🖥️ Pantallas Grandes (Escritorio / 1920px - 4 Columnas) */
@media (min-width: 1200px) {
  .character-form {
    display: grid;
    grid-template-columns: repeat(4, 1fr); 
    grid-auto-rows: 10px;                  
    gap: 10px;                           
    padding: 10px;
    align-items: start;
  }

  .ancho-total {
    grid-column: span 4;
    grid-row-end: span 3; 
  }

  .ancho-medio {
    grid-column: span 2; 
  }

  .ancho-3{
    grid-column: span 3;
  }

  .character-form > :not(.ancho-total):not(.ancho-medio):not(.ancho-3) {
    grid-column: span 1;
  }

  .columna-1{
    grid-column: 1 !important;
  }
}
</style>