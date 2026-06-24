<template>
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-content">
      <h3>Seleccionar Dote ({{ tipoFiltro }})</h3>
      
      <div class="form-group mb-4">
        <label>
          Elige una dote para <strong>{{ claseOrigen }}</strong> al alcanzar el Nivel <strong>{{ nivelOrigen }}</strong>
        </label>
        
        <select v-model="doteSeleccionada" class="select-dote">
          <option value="" disabled>Selecciona una dote...</option>
          <option v-for="dote in dotesFiltradas" :key="dote.nombre" :value="dote.nombre">
            {{ dote.nombre }}
          </option>
        </select>
        
        <div v-if="doteData" class="dote-descripcion">
          <p>{{ doteData.descripcion }}</p>
        </div>
      </div>

      <div class="modal-actions mt-4">
        <BaseButton variant="secondary" type="button" @click="$emit('cerrar')">Cancelar</BaseButton>
        <BaseButton 
          variant="primary" 
          type="button" 
          @click="procesarGuardado" 
          :disabled="!doteSeleccionada"
        >
          Confirmar Elección
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseButton from '../common/BaseButton.vue'
import datosMundo from '../../data/data.json'

const props = defineProps({
  mostrar: Boolean,
  claseOrigen: String,
  nivelOrigen: Number,
  tipoFiltro: String
})

const emit = defineEmits(['cerrar', 'guardar-mejora'])

const doteSeleccionada = ref('')

// Filtramos leyendo directamente el JSON usando el prop dinámico
const dotesFiltradas = computed(() => {
  if (!datosMundo.dotes) return []
  return datosMundo.dotes.filter(d => d.Tipo === props.tipoFiltro)
})

// Computed para mostrar la descripción al usuario
const doteData = computed(() => {
  return dotesFiltradas.value.find(d => d.nombre === doteSeleccionada.value)
})

const procesarGuardado = () => {
  if (!doteSeleccionada.value) return

  // Creamos el objeto estructurado con las coordenadas exactas para la auto-verificación
  const nuevaDote = {
    nombre: doteSeleccionada.value,
    tipo: props.tipoFiltro,
    fuente: props.claseOrigen,
    nivel_adquirido: props.nivelOrigen
  }

  emit('guardar-mejora', nuevaDote)
  doteSeleccionada.value = '' // Limpieza visual del modal
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-content { 
  background: white; padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; 
}
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.mb-4 { margin-bottom: 1rem; } 
.mt-4 { margin-top: 1rem; }
.select-dote {
  padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; width: 100%; font-size: 1rem;
}
.dote-descripcion {
  margin-top: 10px; padding: 10px; background-color: #f5f5f5; border-left: 4px solid #7b1fa2; border-radius: 4px; font-size: 0.9em; line-height: 1.4;
}
</style>