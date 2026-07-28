<template>
  <form @submit.prevent="guardarPersonaje" class="character-form">
    
    <!-- Cabecera Intacta -->
    <div class="character-form__header ancho-total">
      <h2>{{ esEdicion ? 'Editar Personaje' : 'Nuevo Personaje' }}</h2>
      <div class="actions">
        <BaseButton variant="secondary" type="button" @click="$emit('cancelar')">Cancelar</BaseButton>
        <BaseButton variant="primary" type="submit">Guardar</BaseButton>
      </div>
    </div>

    <!-- Navegación de Pestañas -->
    <nav class="tabs-nav ancho-total">
      <button 
        type="button" 
        class="menu-movil-btn" 
        @click="menuMovilAbierto = !menuMovilAbierto"
      >
        ☰ Menú de Pestañas
      </button>
      <ul class="tabs-lista" :class="{ 'abierto': menuMovilAbierto }">
        <li 
          v-for="pestana in pestañas" 
          :key="pestana.id"
          :class="{ 'activa': pestanaActiva === pestana.id }"
          @click="cambiarPestana(pestana.id)"
        >
          {{ pestana.nombre }}
        </li>
      </ul>
    </nav>

    <!-- Contenedor Grid Dinámico -->
    <div class="masonry-grid ancho-total" ref="gridRef">
      
      <!-- ================= PESTAÑA: INFORMACIÓN ================= -->
      <CharacterBasicInfo 
        v-if="pestanaActiva === 'informacion'" 
        v-model="formData" 
        class="ancho-medio"
      />

      <CharacterStats 
        v-if="pestanaActiva === 'informacion'"
        v-model:caracteristicas="formData.caracteristicasBase" 
        v-model:salvaciones="formData.salvaciones"
        :salvacionesCalculadas="salvacionesCalculadas"
        :salvacionesClasePrincipal="salvacionesClasePrincipal" 
        class="ancho-medio"
      />

      <CharacterSkills 
        v-if="pestanaActiva === 'informacion'"
        v-model="formData.habilidades" 
        :habilidadesCalculadas="habilidadesCalculadas" 
        class="ancho-medio"
      />

      <CharacterProficiencies
        v-if="pestanaActiva === 'informacion'"
        v-model:competenciasArmas="formData.competenciasArmas"
        v-model:competenciasArmaduras="formData.competenciasArmaduras"
        v-model:herramientas="formData.herramientas"
        v-model:idiomas="formData.idiomas"
        class="ancho-medio"
      />


      <!-- ================= PESTAÑA: RASGOS ================= -->
      <CharacterTraits 
        v-if="pestanaActiva === 'rasgos'"
        :rasgos="rasgosPersonaje" 
        :clasesPersonaje="formData.clases" 
        v-model:opcionesRasgos="formData.opcionesRasgos"
        class="ancho-total"
      />


      <!-- ================= PESTAÑA: COMBATE ================= -->
      <CharacterFeatures 
        v-if="pestanaActiva === 'combate'"
        v-model:ca="formData.ca" 
        v-model:velocidad="formData.velocidad" 
        v-model:inspiracion="formData.inspiracion"
        v-model:modificadoresIniciativa="formData.modificadoresIniciativa"
        :combateCalculado="combateCalculado" 
        class="ancho-medio"
      />

      <CharacterHealth 
        v-if="pestanaActiva === 'combate'"
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
        v-if="pestanaActiva === 'combate'"
        v-model="formData"
        :espaciosEstandarMax="espaciosEstandar"
        :espaciosPactoMax="espaciosPacto"
        @reset-estandar="resetearMagiaEstandar"
        @reset-pacto="resetearMagiaPacto"
        @reset-personalizados="resetearRecursosPersonalizados"
        class="ancho-medio"
      />

      <CharacterAttacks 
        v-if="pestanaActiva === 'combate'"
        v-model="formData.ataques" 
        class="ancho-medio" 
      />

      <CharacterSpells 
        v-if="pestanaActiva === 'combate'"
        v-model="formData.hechizos" 
        :clasesPersonaje="formData.clases"
        class="ancho-total"
      />


      <!-- ================= PESTAÑA: INVENTARIO ================= -->
      <CharacterEquipment 
        v-if="pestanaActiva === 'inventario'"
        v-model="formData.equipo" 
        :pesoActualEquipado="pesoActualEquipado"
        :capacidadCargaCalculada="capacidadCargaCalculada"
        class="ancho-total"
      />


      <!-- ================= PESTAÑA: HISTORIA ================= -->
      <CharacterPersonality 
        v-if="pestanaActiva === 'historia'"
        v-model="formData.personalidad" 
        class="ancho-total"
      />

    </div>
  </form>

  <!-- Alertas y Modales Globales -->
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
import CharacterSpells from './CharacterSpells.vue'
import CharacterProficiencies from './CharacterProficiencies.vue'
import { useCharacterCalculations } from '../../composables/useCharacterCalculations.js'
import LevelUpAlert from './LevelUpAlert.vue'
import LevelUpModal from './LevelUpModal.vue'
import CharacterTraits from './CharacterTraits.vue'
import { generarPersonajeBase } from '../../utils/esquemaPersonaje.js';

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

const formData = ref(generarPersonajeBase())

const esEdicion = ref(false)

// ==========================================
// LÓGICA DE PESTAÑAS (NUEVO)
// ==========================================
const pestanaActiva = ref('informacion')
const menuMovilAbierto = ref(false)

const pestañas = [
  { id: 'informacion', nombre: 'Información' },
  { id: 'rasgos', nombre: 'Rasgos' },
  { id: 'combate', nombre: 'Combate' },
  { id: 'inventario', nombre: 'Inventario' },
  { id: 'historia', nombre: 'Historia' }
]

const cambiarPestana = (id) => {
  pestanaActiva.value = id
  menuMovilAbierto.value = false
}

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

const gridRef = ref(null); // Cambiado de formRef a gridRef
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

  if (gridRef.value) {
    const hijosIniciales = gridRef.value.children;
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

    mutationObserver.observe(gridRef.value, { childList: true });
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
  gap: 1rem;
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

.alerta {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  text-align: center;
  padding: 10px 2rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); 
}

/* ==========================================
   NAVEGACIÓN DE PESTAÑAS (MÓVIL POR DEFECTO)
   ========================================== */
.tabs-nav {
  position: relative;
  width: 100%;
  z-index: 100;
  margin-bottom: 1rem;
}

/* Botón Hamburguesa */
.menu-movil-btn {
  width: 100%;
  padding: 1rem 1.5rem;
  background-color: var(--color-primary, #7b1fa2);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
}

.menu-movil-btn:hover {
  background-color: var(--color-primary-dark, #4a148c);
}

/* Lista Desplegable (Móvil) */
.tabs-lista {
  display: none; /* Oculto por defecto */
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: var(--color-surface, #ffffff);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eaeaea;
}

.tabs-lista.abierto {
  display: block; /* Se muestra al alternar el booleano en el template */
}

/* Elementos de la lista (Pestañas) */
.tabs-lista li {
  width: 100%;
  text-align: left;
  padding: 1rem 1.5rem;
  background: transparent;
  border-bottom: 1px solid #f0f0f0;
  font-size: 1rem;
  color: var(--color-text-primary, #444);
  cursor: pointer;
  transition: all 0.3s ease;
}

.tabs-lista li:last-child {
  border-bottom: none;
}

/* Feedback al pasar el ratón en móvil */
.tabs-lista li:hover {
  background: var(--color-surface-variant, #f8f9fa);
  padding-left: 2rem; 
  color: var(--color-primary, #7b1fa2);
}

/* Estado activo en móvil */
.tabs-lista li.activa {
  background: var(--color-primary-light, #ae52d4);
  color: white;
  font-weight: bold;
}

.tabs-lista li.activa:hover {
  padding-left: 1.5rem; /* Resetea el padding del hover si está activo */
}

/* ==========================================
   GRID MASONRY (DISPOSICIÓN MÓVIL)
   ========================================== */
.masonry-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ==========================================
   🖥️ TABLETS Y ESCRITORIO (MENÚ HORIZONTAL)
   ========================================== */
@media (min-width: 992px) {
  
  .menu-movil-btn {
    display: none; /* Ocultamos la hamburguesa */
  }
  
  /* Contenedor tipo píldora (Segmented Control) */
  .tabs-lista {
    display: flex !important; /* Forzamos la vista horizontal */
    flex-direction: row;
    position: static;
    background: #f0f4f8; 
    padding: 0.5rem;
    border-radius: 12px;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
    border: none;
    gap: 0.5rem;
    margin-top: 0;
  }
  
  .tabs-lista li {
    flex: 1; /* Distribuye el espacio equitativamente */
    text-align: center;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    padding: 0.75rem 1rem;
    color: #666;
    display: block;
    width: 100%;
  }

  /* Feedback hover en escritorio */
  .tabs-lista li:hover {
    background: rgba(0, 0, 0, 0.03);
    padding-left: 1rem; /* Sobrescribimos la animación de móvil */
    color: var(--color-primary, #7b1fa2);
  }

  /* Pestaña Activa en escritorio: Efecto tarjeta levantada */
  .tabs-lista li.activa {
    background: #ffffff;
    color: var(--color-primary, #7b1fa2);
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .tabs-lista li.activa:hover {
    padding-left: 1rem;
  }
}

/* ==========================================
   🖥️ PANTALLAS GRANDES (MASONRY GRID 4 COLUMNAS)
   ========================================== */
@media (min-width: 1200px) {
  .masonry-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr); 
    grid-auto-rows: 10px;                  
    gap: 10px;                           
    padding: 10px 0;
    align-items: start;
  }

  /* Las clases de ancho ahora aplican a los hijos directos del grid */
  .masonry-grid > .ancho-total {
    grid-column: span 4;
  }

  .masonry-grid > .ancho-medio {
    grid-column: span 2; 
  }

  .masonry-grid > .ancho-3 {
    grid-column: span 3;
  }

  .masonry-grid > :not(.ancho-total):not(.ancho-medio):not(.ancho-3) {
    grid-column: span 1;
  }

  .masonry-grid > .columna-1 {
    grid-column: 1 !important;
  }
}
</style>