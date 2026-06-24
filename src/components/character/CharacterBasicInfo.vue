<template>
  <div class="character-section">
    <div class="form-grid">
      <div class="form-group full-width">
        <label for="nombre">Nombre del Personaje</label>
        <input 
          id="nombre" 
          type="text" 
          v-model="datos.nombre" 
          placeholder="Ej. Gandalf" 
          required 
        />
      </div>

      <div class="form-group full-width class-container">
        <div class="class-header">
          <label>Clases y Niveles</label>
          <div class="badges-group">
            <span class="total-level">Nivel Total: {{ nivelTotal }}</span>
          </div>
        </div>
        
        <div v-for="(clase, index) in datos.clases" :key="index" class="class-row">
          
          <div class="form-group">
            <label>Clase</label>
            <select 
              :value="clase.nombre" 
              @change="(event) => alCambiarClase(event, index)"
            >
            <option value="">Selecciona...</option>
            <option v-for="c in listadoClases" :key="c.nombre" :value="c.nombre">
              {{ c.nombre }}
            </option>
            </select>
          </div>

          <div class="form-group level-control-group">
            <label>Nivel</label>
            <div class="level-display">
              <span class="level-text">{{ clase.nivel }}</span>
              <BaseButton 
                variant="primary" 
                type="button" 
                @click="subirNivel(index)" 
                :disabled="clase.nivel >= 20 || !clase.nombre"
                class="btn-levelup"
              >
                +
              </BaseButton>
            </div>
          </div>

          <div class="form-group">
            <label>Subclase</label>
            <select v-model="clase.subclase">
              <option value="">Selecciona...</option>
              <option v-for="sub in obtenerSubclases(clase.nombre)" :key="sub.nombre" :value="sub.nombre">
                {{ sub.nombre }}
              </option>
            </select>
          </div>
          
          <BaseButton 
            v-if="datos.clases.length > 1" 
            variant="danger" 
            type="button" 
            @click="eliminarClase(index)" 
            class="btn-delete"
          >
            X
          </BaseButton>
        </div>
        
        <BaseButton variant="secondary" type="button" @click="agregarClase">
          + Añadir Clase
        </BaseButton>
      </div>

      <div class="form-group">
        <label for="especie">Especie</label>
        <select id="especie" v-model="datos.especie" @change="alCambiarEspecie" required>
          <option disabled value="">Selecciona una especie</option>
          <option v-for="esp in listadoEspecies" :key="esp.nombre" :value="esp.nombre">
            {{ esp.nombre }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="raza">Linaje</label>
        <select id="raza" v-model="datos.raza" required>
          <option disabled value="">Selecciona un linaje</option>
          <option v-for="raza in razasDisponibles" :key="raza.nombre" :value="raza.nombre">
            {{ raza.nombre }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="trasfondo">Trasfondo</label>
        <select id="trasfondo" :value="datos.trasfondo || ''" @change="alCambiarTrasfondo" required>
          <option disabled value="">Selecciona un trasfondo</option>
          <option v-for="t in listadoTrasfondos" :key="t.nombre" :value="t.nombre">
            {{ t.nombre }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="esRazaVersatil">
        <label for="doteVersatil">Dote Adicional (Versátil)</label>
        <select id="doteVersatil" :value="doteVersatilSeleccionada" @change="alCambiarDoteVersatil" required>
          <option disabled value="">Selecciona una dote</option>
          <option v-for="dote in listadoDotesOrigen" :key="dote.nombre" :value="dote.nombre">
            {{ dote.nombre }}
          </option>
        </select>
      </div>
    </div>

    <h3 class="section-subtitle">Puntos de Golpe</h3>
    <div class="form-grid">
      <div class="form-group">
        <label for="pgMax">PG Máximos</label>
        <input id="pgMax" type="number" min="1" v-model.number="datos.puntosVidaMax" required />
      </div>
      <div class="form-group">
        <label for="pgActual">PG Actuales</label>
        <input id="pgActual" type="number" min="0" :max="datos.puntosVidaMax" v-model.number="datos.puntosVidaActuales" required />
      </div>
      <div class="form-group">
        <label for="pgTemp">PG Temporales</label>
        <input id="pgTemp" type="number" min="0" v-model.number="datos.pgTemp" placeholder="0" />
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, watch } from 'vue' // Añadido watch para limpieza automática
import datosMundo from '../../data/data.json'
import BaseButton from '../common/BaseButton.vue'
import { calcularNivelTotal, calcularPB } from '../../utils/calculations.js'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const datos = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// === Lógica de Clases ===
const listadoClases = computed(() => datosMundo.clases || [])

const obtenerSubclases = (nombreClase) => {
  if (!nombreClase) return []
  const claseEncontrada = listadoClases.value.find(c => c.nombre === nombreClase)
  return claseEncontrada && claseEncontrada.subclases ? claseEncontrada.subclases : []
}

const agregarClase = () => {
  datos.value.clases.push({ nombre: '', nivel: 1, subclase: '' })
}

const eliminarClase = (index) => {
  datos.value.clases.splice(index, 1)
}

const alCambiarClase = (payload, index = 0) => {
  let claseSeleccionada = payload?.target?.value !== undefined ? payload.target.value : payload;
  if (!claseSeleccionada) return;

  const personajeActualizado = { ...props.modelValue };
  const nuevasClases = [...personajeActualizado.clases];

  nuevasClases[index] = {
    ...nuevasClases[index],
    nombre: claseSeleccionada,
    subclase: ''
  };

  personajeActualizado.clases = nuevasClases;
  emit('update:modelValue', personajeActualizado);
}

const alCambiarSubclase = (payload, index = 0) => {
  let subclaseSeleccionada = payload?.target?.value !== undefined ? payload.target.value : payload;
  if (!subclaseSeleccionada) return;

  const personajeActualizado = { ...props.modelValue };
  const nuevasClases = [...personajeActualizado.clases];

  nuevasClases[index] = {
    ...nuevasClases[index],
    subclase: subclaseSeleccionada
  };

  personajeActualizado.clases = nuevasClases;
  emit('update:modelValue', personajeActualizado);
}

const subirNivel = (index) => {
  const claseActual = datos.value.clases[index]
  let nivelActual = parseInt(claseActual.nivel) || 1
  claseActual.nivel = nivelActual + 1
}

const nivelTotal = computed(() => calcularNivelTotal(datos.value.clases))
const bonificadorCompetencia = computed(() => calcularPB(nivelTotal.value))

// === Lógica de Especies ===
const listadoEspecies = computed(() => datosMundo.especies || [])

const razasDisponibles = computed(() => {
  if (!datos.value.especie) return []
  const especieSeleccionada = listadoEspecies.value.find(e => e.nombre === datos.value.especie)
  return especieSeleccionada && especieSeleccionada.razas ? especieSeleccionada.razas : []
})

const alCambiarEspecie = () => {
  datos.value.raza = ''
  const razas = razasDisponibles.value
  if (razas.length === 1) {
    datos.value.raza = razas[0].nombre
  }
}

// === NUEVO: Lógica de Trasfondos y Dotes ===
const listadoTrasfondos = computed(() => datosMundo.trasfondos || [])

// Filtramos las dotes específicamente por Tipo: "Origen"
const listadoDotesOrigen = computed(() => {
  return (datosMundo.dotes || []).filter(dote => dote.Tipo === 'Origen')
})

const alCambiarTrasfondo = (event) => {
  const nombreTrasfondo = event.target.value
  if (!nombreTrasfondo) return

  const personajeActualizado = { ...props.modelValue }
  personajeActualizado.trasfondo = nombreTrasfondo
  
  // Clonamos el array de dotes para mantener reactividad limpia
  let dotesActuales = personajeActualizado.dotes ? [...personajeActualizado.dotes] : []
  
  // Removemos la dote de trasfondo anterior en caso de que el jugador cambie de opinión
  dotesActuales = dotesActuales.filter(d => d.fuente !== 'Trasfondo')
  
  // Buscamos el trasfondo y añadimos su dote
  const trasfondoData = listadoTrasfondos.value.find(t => t.nombre === nombreTrasfondo)
  if (trasfondoData && trasfondoData.dote) {
    dotesActuales.push({
      nombre: trasfondoData.dote,
      tipo: 'Origen',
      fuente: 'Trasfondo',
      nivel_adquirido: 1
    })
  }
  
  personajeActualizado.dotes = dotesActuales
  emit('update:modelValue', personajeActualizado)
}

// === NUEVO: Lógica de Raza Versátil ===
// Computada para saber si mostramos el segundo selector
const esRazaVersatil = computed(() => {
  if (!datos.value.especie || !datos.value.raza) return false
  const especieData = listadoEspecies.value.find(e => e.nombre === datos.value.especie)
  if (!especieData || !especieData.razas) return false
  
  const razaData = especieData.razas.find(r => r.nombre === datos.value.raza)
  if (!razaData || !razaData.rasgos) return false
  
  // Devuelve true si encuentra "Versátil" en algún lugar de los rasgos
  return razaData.rasgos.some(rasgo => rasgo.toLowerCase().includes('versátil'))
})

// Watcher de limpieza: si cambias de raza a una que NO es versátil, borra la dote extra
watch(esRazaVersatil, (esVersatil) => {
  if (!esVersatil && props.modelValue.dotes) {
    const dotesLimpias = props.modelValue.dotes.filter(d => d.fuente !== 'Raza (Versátil)')
    // Solo emitimos si efectivamente se eliminó algo (evita ciclos infinitos)
    if (dotesLimpias.length !== props.modelValue.dotes.length) {
      emit('update:modelValue', { ...props.modelValue, dotes: dotesLimpias })
    }
  }
})

// Computada para mantener el valor visible en el <select> de dote versátil
const doteVersatilSeleccionada = computed(() => {
  if (!datos.value.dotes) return ''
  const dote = datos.value.dotes.find(d => d.fuente === 'Raza (Versátil)')
  return dote ? dote.nombre : ''
})

const alCambiarDoteVersatil = (event) => {
  const nombreDote = event.target.value
  if (!nombreDote) return

  const personajeActualizado = { ...props.modelValue }
  let dotesActuales = personajeActualizado.dotes ? [...personajeActualizado.dotes] : []
  
  // Limpiamos la elección previa del selector versátil
  dotesActuales = dotesActuales.filter(d => d.fuente !== 'Raza (Versátil)')
  
  dotesActuales.push({
    nombre: nombreDote,
    tipo: 'Origen',
    fuente: 'Raza (Versátil)',
    nivel_adquirido: 1
  })
  
  personajeActualizado.dotes = dotesActuales
  emit('update:modelValue', personajeActualizado)
}
</script>

<style scoped>
/* Los estilos se mantienen idénticos, la clase .form-grid acomodará los nuevos campos de forma nativa */
.full-width {
  grid-column: 1 / -1;
}
.class-container {
  background: var(--color-background, #f5f0e8);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.badges-group {
  display: flex;
  gap: 0.5rem;
}
.total-level, .pb-badge {
  font-weight: bold;
  font-size: 0.9rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}
.total-level {
  color: var(--color-primary, #7b1fa2);
  background: white;
  border: 1px solid var(--color-primary-light, #ae52d4);
}
.pb-badge {
  color: white;
  background: var(--color-success, #ae52d4);
  border: 1px solid var(--color-success, #4caf50);
}
.class-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  align-items: center;
}
.class-row > .form-group {
  flex: 1; 
}
.class-row > .level-control-group {
  flex: 0 0 auto;
}
.class-row select {
  width: 100%;
}
.class-row > .btn-delete {
  flex: 0 0 auto;
  align-self: flex-end; 
  margin-bottom: 2px; 
}

@media (max-width: 640px) {
  .class-row {
    flex-wrap: wrap;
  }
  .class-row > .form-group { 
    flex: 1 1 100%; 
  }
}
.character-section {
  padding: 1rem;
  background: var(--color-surface, #ffffff);
  border-radius: var(--border-radius, 4px);
  margin-bottom: 1rem;
}
.section-subtitle {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-primary, #7b1fa2);
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group label {
  font-weight: bold;
  font-size: 0.9rem;
  color: var(--color-text-secondary, #757575);
}
.form-group input, .form-group select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.level-control-group {
  display: flex;
  flex-direction: column;
}
.level-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-background, #f5f0e8);
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  height: 38px;
}
.level-text {
  font-weight: bold;
  font-size: 1.1rem;
  min-width: 20px;
  text-align: center;
}
.btn-levelup {
  padding: 0.1rem 0.5rem;
  font-size: 1.2rem;
  line-height: 1;
  border-radius: 4px;
}
</style>