import { defineStore } from 'pinia'

export const useDataStore = defineStore('data', {
  state: () => ({
    gameData: null, // Para data.json (clases, especies, etc.)
    spellSlots: null, // Para espacios-conjuro.json
    spells: [], // Para hechizos.json
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchAllData() {
      this.loading = true
      this.error = null
      
      try {
        // Asumiendo que los archivos JSON se colocarán en public/data/ 
        // o son importados directamente si están en src/data/
        const [dataRes, slotsRes, spellsRes] = await Promise.all([
          fetch('/data/data.json').then(res => res.json()),
          fetch('/data/espacios-conjuro.json').then(res => res.json()),
          fetch('/data/hechizos.json').then(res => res.json())
        ])
        
        this.gameData = dataRes
        this.spellSlots = slotsRes
        this.spells = spellsRes
      } catch (err) {
        console.error('Error cargando los datos estáticos:', err)
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