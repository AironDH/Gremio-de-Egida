import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

export const useCharacterStore = defineStore('character', {
  state: () => ({
    // Intenta leer del LocalStorage al inicializar la aplicación
    personajes: JSON.parse(localStorage.getItem('gremio_egida_personajes')) || []
  }),
  
  actions: {
    guardarEnLocalStorage() {
      localStorage.setItem('gremio_egida_personajes', JSON.stringify(this.personajes))
    },
    
    eliminarPersonaje(id) {
      this.personajes = this.personajes.filter(p => p.id !== id)
      this.guardarEnLocalStorage()
    },
    
    importarPersonajes(archivo) {
      return new Promise((resolve, reject) => {
        const lector = new FileReader()
        lector.onload = (e) => {
          try {
            const importados = JSON.parse(e.target.result)
            // Asegura compatibilidad tanto si es un array como si es un único objeto
            const lista = Array.isArray(importados) ? importados : [importados]
            
            lista.forEach(p => {
              this.personajes.push({
                id: p.id || uuidv4(),
                nombre: p.nombre || 'Héroe sin nombre',
                nivel: p.nivel || 1,
                clase: p.clase || 'Guerrero',
                especie: p.especie || 'Humano',
                puntosVidaMax: p.puntosVidaMax || 10,
                puntosVidaActuales: p.puntosVidaActuales || 10,
                // Mantiene el resto de propiedades si vienen de un archivo extendido
                ...p 
              })
            })
            
            this.guardarEnLocalStorage()
            resolve(true)
          } catch (error) {
            reject(new Error('Formato de JSON inválido'))
          }
        }
        lector.onerror = () => reject(new Error('Error al leer el archivo'))
        lector.readAsText(archivo)
      })
    },
    
    exportarPersonajes() {
      if (this.personajes.length === 0) return alert('No hay personajes para exportar')
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.personajes, null, 2))
      const enlaceDescarga = document.createElement('a')
      enlaceDescarga.setAttribute("href", dataStr)
      enlaceDescarga.setAttribute("download", `gremio_egida_personajes_${new Date().toISOString().slice(0, 10)}.json`)
      document.body.appendChild(enlaceDescarga)
      enlaceDescarga.click()
      enlaceDescarga.remove()
    }
  }
})