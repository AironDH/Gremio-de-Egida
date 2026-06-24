<template>
  <div class="character-section">
    <h3 class="section-title">Recursos de Habilidad y Magia</h3>

    <div v-if="tieneMagiaEstandar" class="resource-block">
      <div class="block-header">
        <h4>Espacios de Conjuro</h4>
        <BaseButton variant="secondary" type="button" @click="$emit('reset-estandar')" class="btn-descanso">
          Descanso Largo
        </BaseButton>
      </div>
      
      <div class="slots-grid">
        <div v-for="(maximo, nivel) in espaciosEstandarMax" :key="'std-'+nivel" class="slot-box">
          <label>Nivel {{ nivel }}</label>
          <div class="slot-inputs">
            <input 
              type="number" 
              v-model.number="datos.recursosMagicos.estandar[nivel]" 
              min="0" 
              :max="maximo" 
              class="input-actual"
            />
            <span class="separator">/</span>
            <span class="slot-max">{{ maximo }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="tieneMagiaPacto" class="resource-block">
      <div class="block-header">
        <h4>Magia de Pacto</h4>
        <BaseButton variant="secondary" type="button" @click="$emit('reset-pacto')" class="btn-descanso">
          Descanso Corto
        </BaseButton>
      </div>
      
      <div class="slots-grid">
        <div class="slot-box pact-box">
          <label>Nivel {{ espaciosPactoMax.slot_level }} (Pacto)</label>
          <div class="slot-inputs">
            <input 
              type="number" 
              v-model.number="datos.recursosMagicos.pacto.slots" 
              min="0" 
              :max="espaciosPactoMax.slots"
              class="input-actual"
            />
            <span class="separator">/</span>
            <span class="slot-max">{{ espaciosPactoMax.slots }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="resource-block custom-resources">
      <div class="block-header">
        <h4>Otros Recursos</h4>
        <BaseButton 
          v-if="datos.recursosPersonalizados.length > 0"
          variant="secondary" 
          type="button" 
          @click="$emit('reset-personalizados')" 
          class="btn-descanso"
        >
          Recuperar Todos
        </BaseButton>
      </div>
      
      <div class="recursos-list">
        <div class="recurso-row header-row" v-if="datos.recursosPersonalizados.length > 0">
          <span class="col-nombre">Nombre del Recurso</span>
          <span class="col-numero">Actual</span>
          <span class="col-numero">Máximo</span>
          <span class="col-btn"></span>
        </div>

        <div v-for="(recurso, index) in datos.recursosPersonalizados" :key="index" class="recurso-row">
          <input 
            type="text" 
            v-model="recurso.nombre" 
            placeholder="Ej. Puntos de Ki, Furia, Inspiración..." 
            class="col-nombre"
          />
          <input 
            type="number" 
            v-model.number="recurso.actual" 
            placeholder="0" 
            min="0"
            class="col-numero input-actual"
          />
          <input 
            type="number" 
            v-model.number="recurso.maximo" 
            placeholder="Máx" 
            min="1"
            class="col-numero input-maximo"
            title="Valor Máximo"
          />
          <BaseButton variant="danger" type="button" @click="eliminarRecurso(index)" class="col-btn">
            X
          </BaseButton>
        </div>
        
        <BaseButton variant="primary" type="button" @click="agregarRecurso" class="btn-add">
          + Añadir Recurso
        </BaseButton>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseButton from '../common/BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  espaciosEstandarMax: {
    type: Object,
    default: () => ({})
  },
  espaciosPactoMax: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits([
  'update:modelValue', 
  'reset-estandar', 
  'reset-pacto', 
  'reset-personalizados'
])

const datos = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const tieneMagiaEstandar = computed(() => {
  return Object.keys(props.espaciosEstandarMax).length > 0
})

const tieneMagiaPacto = computed(() => {
  return props.espaciosPactoMax && props.espaciosPactoMax.slots > 0
})

const agregarRecurso = () => {
  if (!datos.value.recursosPersonalizados) {
    datos.value.recursosPersonalizados = []
  }
  datos.value.recursosPersonalizados.push({ nombre: '', actual: 0, maximo: 1 })
}

const eliminarRecurso = (index) => {
  datos.value.recursosPersonalizados.splice(index, 1)
}
</script>

<style scoped>
.character-section {
  padding: 1.5rem;
  background: var(--color-surface, #ffffff);
  border-radius: var(--border-radius, 4px);
  margin-bottom: 1rem;
}
.section-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--color-primary, #7b1fa2);
  border-bottom: 2px solid var(--color-primary-light, #ae52d4);
  padding-bottom: 0.5rem;
}
.resource-block {
  margin-bottom: 2rem;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
}
.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.block-header h4 {
  margin: 0;
  color: #333;
}
.btn-descanso {
  font-size: 0.85em;
  padding: 0.3rem 0.8rem;
}

/* Grilla de Espacios de Conjuro */
.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
}
.slot-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.pact-box {
  border-color: #7b1fa2;
  background-color: #fdf5ff;
}
.slot-box label {
  font-size: 0.85em;
  font-weight: bold;
  color: #555;
  margin-bottom: 0.5rem;
}
.slot-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.slot-inputs input {
  width: 45px;
  text-align: center;
  font-size: 1.1em;
  padding: 0.25rem;
  border: 1px solid #aaa;
  border-radius: 4px;
}
.separator {
  font-weight: bold;
  color: #888;
}
.slot-max {
  font-size: 1.1em;
  font-weight: bold;
  color: #333;
  width: 30px;
  text-align: center;
}

/* Tabla de Otros Recursos */
.recursos-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.recurso-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.header-row {
  font-size: 0.85em;
  font-weight: bold;
  color: #666;
  margin-bottom: 0.2rem;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid #ddd;
}
.col-nombre {
  flex: 1;
}
.col-numero {
  width: 70px;
  text-align: center;
}
.col-btn {
  width: 40px;
}
.recurso-row input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.input-actual {
  background-color: white;
}

/* DISEÑO DIFERENCIADO DEL CAMPO MÁXIMO */
.input-maximo {
  background-color: #eaeaea;
  border: 2px dashed #888;
  font-weight: bold;
  color: #222;
  transition: border-color 0.2s ease;
}
.input-maximo:focus {
  border-color: var(--color-primary, #7b1fa2);
  background-color: #f4e8f8;
  outline: none;
}

.btn-add {
  align-self: flex-start;
  margin-top: 0.5rem;
}

@media (max-width: 600px) {
  .recurso-row {
    flex-wrap: wrap;
  }
  .col-nombre {
    flex: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>