<template>
  <div class="character-section proficiencies-container">
    <div class="section-header">
      <h3 class="section-title">Competencias e Idiomas</h3>
    </div>

    <div class="proficiencies-grid">
      <!-- Sección: Armas -->
      <div class="proficiency-section">
        <h4>Armas</h4>
        <div class="input-wrapper">
          <input 
            type="text" 
            v-model="inputArma" 
            list="lista-armas" 
            placeholder="Añadir competencia en arma..."
            @keyup.enter="agregarCompetencia('competenciasArmas')"
          />
          <button type="button" class="add-btn" @click="agregarCompetencia('competenciasArmas')">+</button>
        </div>
        <datalist id="lista-armas">
          <option v-for="arma in competenciasData.armas" :key="arma" :value="arma"></option>
        </datalist>
        
        <div class="tags-container">
          <span v-for="(item, index) in competenciasArmas" :key="'arma-'+index" class="tag">
            {{ item }}
            <button type="button" class="delete-tag" @click="eliminarCompetencia('competenciasArmas', index)">×</button>
          </span>
          <div v-if="competenciasArmas.length === 0" class="empty-state">Sin competencias añadidas</div>
        </div>
      </div>

      <!-- Sección: Armaduras -->
      <div class="proficiency-section">
        <h4>Armaduras</h4>
        <div class="input-wrapper">
          <input 
            type="text" 
            v-model="inputArmadura" 
            list="lista-armaduras" 
            placeholder="Añadir competencia en armadura..."
            @keyup.enter="agregarCompetencia('competenciasArmaduras')"
          />
          <button type="button" class="add-btn" @click="agregarCompetencia('competenciasArmaduras')">+</button>
        </div>
        <datalist id="lista-armaduras">
          <option v-for="armadura in competenciasData.armaduras" :key="armadura" :value="armadura"></option>
        </datalist>
        
        <div class="tags-container">
          <span v-for="(item, index) in competenciasArmaduras" :key="'armadura-'+index" class="tag">
            {{ item }}
            <button type="button" class="delete-tag" @click="eliminarCompetencia('competenciasArmaduras', index)">×</button>
          </span>
          <div v-if="competenciasArmaduras.length === 0" class="empty-state">Sin competencias añadidas</div>
        </div>
      </div>

      <!-- Sección: Herramientas -->
      <div class="proficiency-section">
        <h4>Herramientas</h4>
        <div class="input-wrapper">
          <input 
            type="text" 
            v-model="inputHerramienta" 
            list="lista-herramientas" 
            placeholder="Añadir herramienta..."
            @keyup.enter="agregarCompetencia('herramientas')"
          />
          <button type="button" class="add-btn" @click="agregarCompetencia('herramientas')">+</button>
        </div>
        <datalist id="lista-herramientas">
          <optgroup v-for="(lista, categoria) in competenciasData.herramientas" :key="categoria" :label="categoria.replace(/_/g, ' ').toUpperCase()">
            <option v-for="herramienta in lista" :key="herramienta" :value="herramienta"></option>
          </optgroup>
        </datalist>
        
        <div class="tags-container">
          <span v-for="(item, index) in herramientas" :key="'herramienta-'+index" class="tag">
            {{ item }}
            <button type="button" class="delete-tag" @click="eliminarCompetencia('herramientas', index)">×</button>
          </span>
          <div v-if="herramientas.length === 0" class="empty-state">Sin herramientas añadidas</div>
        </div>
      </div>

      <!-- Sección: Idiomas -->
      <div class="proficiency-section">
        <h4>Idiomas</h4>
        <div class="input-wrapper">
          <input 
            type="text" 
            v-model="inputIdioma" 
            list="lista-idiomas" 
            placeholder="Añadir idioma..."
            @keyup.enter="agregarCompetencia('idiomas')"
          />
          <button type="button" class="add-btn" @click="agregarCompetencia('idiomas')">+</button>
        </div>
        <datalist id="lista-idiomas">
          <optgroup v-for="(lista, categoria) in competenciasData.idiomas" :key="categoria" :label="categoria.toUpperCase()">
            <option v-for="idioma in lista" :key="idioma" :value="idioma"></option>
          </optgroup>
        </datalist>
        
        <div class="tags-container">
          <span v-for="(item, index) in idiomas" :key="'idioma-'+index" class="tag">
            {{ item }}
            <button type="button" class="delete-tag" @click="eliminarCompetencia('idiomas', index)">×</button>
          </span>
          <div v-if="idiomas.length === 0" class="empty-state">Sin idiomas añadidos</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import competenciasData from '../../data/competencias.json'

const props = defineProps({
  competenciasArmas: {
    type: Array,
    default: () => []
  },
  competenciasArmaduras: {
    type: Array,
    default: () => []
  },
  herramientas: {
    type: Array,
    default: () => []
  },
  idiomas: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:competenciasArmas',
  'update:competenciasArmaduras',
  'update:herramientas',
  'update:idiomas'
])

// Variables reactivas para los inputs de texto
const inputArma = ref('')
const inputArmadura = ref('')
const inputHerramienta = ref('')
const inputIdioma = ref('')

/**
 * Añade un nuevo elemento al array correspondiente.
 * Evita entradas vacías y duplicados (ignorando mayúsculas/minúsculas).
 */
const agregarCompetencia = (nombreProp) => {
  // Mapeamos dinámicamente la propiedad a su variable reactiva
  const mapaInputs = {
    competenciasArmas: inputArma,
    competenciasArmaduras: inputArmadura,
    herramientas: inputHerramienta,
    idiomas: inputIdioma
  }

  const inputRef = mapaInputs[nombreProp]
  const valor = inputRef.value.trim()
  if (!valor) return

  const listaActual = props[nombreProp] || []
  
  const esDuplicado = listaActual.some(
    item => item.toLowerCase() === valor.toLowerCase()
  )

  if (!esDuplicado) {
    emit(`update:${nombreProp}`, [...listaActual, valor])
  }
  
  // Limpiamos el input después de intentar agregarlo
  inputRef.value = ''
}

/**
 * Elimina un elemento del array basándose en su índice.
 */
const eliminarCompetencia = (nombreProp, index) => {
  const listaActual = [...(props[nombreProp] || [])]
  listaActual.splice(index, 1)
  emit(`update:${nombreProp}`, listaActual)
}
</script>

<style scoped>
.character-section {
  padding: 1.5rem;
  background: var(--color-surface, #ffffff);
  border-radius: var(--border-radius, 4px);
  margin-bottom: 1rem;
}

.section-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.section-title {
  margin: 0;
  color: var(--color-primary, #7b1fa2);
}

.proficiencies-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.proficiency-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.proficiency-section h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-primary, #333);
}

.input-wrapper {
  display: flex;
  gap: 0.5rem;
}

.input-wrapper input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}

.add-btn {
  background: var(--color-primary-light, #ae52d4);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 0.75rem;
  font-weight: bold;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.add-btn:hover {
  background: var(--color-primary, #7b1fa2);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  min-height: 28px; /* Mantiene el espacio aunque no haya elementos */
}

/* Diseño de las etiquetas (Pills) */
.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background-color: var(--color-surface-variant, #f0f4f8);
  color: var(--color-text-primary, #333);
  padding: 0.3rem 0.75rem;
  border-radius: 20px; /* Bordes redondeados para el estilo pill */
  font-size: 0.85rem;
  border: 1px solid #d1d9e0;
  transition: all 0.2s ease;
}

/* Botón 'X' dentro de la etiqueta */
.delete-tag {
  background: transparent;
  border: none;
  color: #999;
  font-size: 1.1rem;
  line-height: 1;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  transition: all 0.2s ease;
}

.delete-tag:hover {
  color: #fff;
  background-color: #d32f2f; /* Rojo claro para indicar eliminación */
}

.empty-state {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #888);
  font-style: italic;
  padding: 0.2rem 0;
}

/* Adaptación para dispositivos móviles */
@media (max-width: 800px) {
  .proficiencies-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}
</style>