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

    // Acción para actualizar un personaje existente
    actualizarPersonaje(personajeActualizado) {
      const index = this.personajes.findIndex(p => p.id === personajeActualizado.id)
      if (index !== -1) {
        this.personajes[index] = personajeActualizado
        this.guardarEnLocalStorage()
      }
    },
    
    importarPersonajes(archivo) {
      return new Promise((resolve, reject) => {
        const lector = new FileReader()
        lector.onload = (e) => {
          try {
            const importados = JSON.parse(e.target.result)
            const lista = Array.isArray(importados) ? importados : [importados]
            
            lista.forEach(p => {
              // 1. Migración de formato antiguo a nuevo si es necesario
              const clasesArray = p.clases || [
                {
                  nombre: p.clase || 'Guerrero',
                  nivel: p.nivel || 1,
                  subclase: p.subclase || ''
                }
              ];

              const nuevoPersonaje = {
                ...p,
                id: p.id || uuidv4(),
                nombre: p.nombre || 'Héroe sin nombre',
                especie: p.especie || 'Humano',
                puntosVidaMax: p.puntosVidaMax || 10,
                puntosVidaActuales: p.puntosVidaActuales || 10,
                clases: clasesArray // Asignamos el arreglo multiclase
              }

              // 2. Limpieza de propiedades legadas para que no se exporten
              delete nuevoPersonaje.clase
              delete nuevoPersonaje.nivel
              delete nuevoPersonaje.subclase

              this.personajes.push(nuevoPersonaje)
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