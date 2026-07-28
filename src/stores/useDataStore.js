import { defineStore } from 'pinia'

// Importamos los JSON directamente (Vite los resuelve automáticamente)
// Ajusta la ruta relativa '../data/...' dependiendo de dónde esté este script
import dataJson from '../data/data.json'
import espaciosConjuroJson from '../data/espacios-conjuro.json'
import hechizosJson from '../data/hechizos.json'

export const useDataStore = defineStore('data', {
  state: () => ({
    // Ya podemos inicializar el estado directamente con los datos
    gameData: dataJson, 
    spellSlots: espaciosConjuroJson, 
    spells: hechizosJson, 
    loading: false,
    error: null
  }),
  
  actions: {
    // Mantenemos la función como async para no romper los componentes 
    // que actualmente estén usando: await store.fetchAllData()
    async fetchAllData() {
      this.loading = true
      
      try {
        // Los datos ya están cargados por los imports, 
        // pero mantenemos la lógica por compatibilidad.
        this.gameData = dataJson
        this.spellSlots = espaciosConjuroJson
        this.spells = hechizosJson
      } catch (err) {
        console.error('Error procesando los datos:', err)
        this.error = 'No se pudieron cargar los datos del juego.'
      } finally {
        this.loading = false
      }
    }
  },

  getters: {
    getClasses: (state) => state.gameData?.clases || [],
    getSpecies: (state) => state.gameData?.especies || [],
    getSpells: (state) => state.spells
  }
})