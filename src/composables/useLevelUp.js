/**
 * Gestiona la automatización de rasgos y la subida de nivel.
 * @param {Object} formData - Referencia reactiva al modelo del personaje.
 * @param {Object} datosMundo - Datos estáticos (data.json) cargados desde el store.
 */

import { computed, ref, watch } from 'vue'

export function useLevelUp(formData, datosMundo) {
  const requiereMejora = ref(false)
  const cantidadMejorasPendientes = ref(0)
  const claseTrigger = ref('')
  const nivelTrigger = ref(0)
  const tipoFiltroDote = ref('')

  // 1. Generador de Rasgos Automáticos
  const rasgosPersonaje = computed(() => {
    const listaRasgos = []
    const datos = datosMundo?.value || datosMundo
    const personaje = formData?.value || formData

    if (!datos || !personaje) return listaRasgos

    // Extracción de Especie y Raza
    if (personaje.especie && personaje.raza && Array.isArray(datos.especies)) {
      const especieData = datos.especies.find(e => e.nombre === personaje.especie)
      if (especieData && Array.isArray(especieData.razas)) {
        const razaData = especieData.razas.find(r => r.nombre === personaje.raza)
        if (razaData && Array.isArray(razaData.rasgos)) {
          razaData.rasgos.forEach(textoRasgo => {
            listaRasgos.push({ nombre: textoRasgo, origen: razaData.nombre, tipo: 'Raza' })
          })
        }
      }
    }

    // Extracción de Clase y Subclase
    if (Array.isArray(personaje.clases) && Array.isArray(datos.clases)) {
      personaje.clases.forEach(clasePj => {
        if (!clasePj || !clasePj.nombre) return
        const claseData = datos.clases.find(c => c.nombre === clasePj.nombre)
        if (!claseData) return

        const nivelMaximo = parseInt(clasePj.nivel, 10) || 1
        for (let i = 1; i <= nivelMaximo; i++) {
          const nivelStr = i.toString()
          if (claseData.rasgos && Array.isArray(claseData.rasgos[nivelStr])) {
            claseData.rasgos[nivelStr].forEach(textoRasgo => {
              listaRasgos.push({ nombre: textoRasgo, origen: claseData.nombre, nivel: i, tipo: 'Clase' })
            })
          }
          if (clasePj.subclase && Array.isArray(claseData.subclases)) {
            const subclaseData = claseData.subclases.find(sc => sc.nombre === clasePj.subclase)
            if (subclaseData && subclaseData.niveles && Array.isArray(subclaseData.niveles[nivelStr])) {
              subclaseData.niveles[nivelStr].forEach(textoRasgo => {
                listaRasgos.push({ nombre: textoRasgo, origen: subclaseData.nombre, nivel: i, tipo: 'Subclase' })
              })
            }
          }
        }
      })
    }

    // Extracción y mapeo dinámico de Dotes seleccionadas
    if (Array.isArray(personaje.dotes)) {
      personaje.dotes.forEach(dote => {
        // Localizamos la descripción correspondiente leyendo el catálogo de dotes de data.json
        const doteCatalogo = Array.isArray(datos.dotes) ? datos.dotes.find(d => d.nombre === dote.nombre) : null
        const descripcionDote = doteCatalogo ? doteCatalogo.descripcion : 'Sin descripción disponible.'
        
        // Formateamos la procedencia de forma amigable (Ej: "Trasfondo", "Raza (Versátil)" o "Guerrero (Nivel 4)")
        let procedencia = dote.fuente
        if (dote.nivel_adquirido && dote.fuente !== 'Trasfondo' && !dote.fuente.includes('Raza')) {
          procedencia = `${dote.fuente} (Nivel ${dote.nivel_adquirido})`
        }

        listaRasgos.push({
          nombre: dote.nombre,
          descripcion: descripcionDote,
          origen: procedencia,
          nivel: dote.nivel_adquirido,
          tipo: 'Dotes'
        })
      })
    }

    return listaRasgos
  })
  
  // 2. Detector de Dotes Pendientes y Auto-limpieza
  watch(
    () => [rasgosPersonaje.value, formData?.value?.dotes],
    ([nuevosRasgos, dotesActuales]) => {
      // Aislamos los rasgos que exigen una elección de dote
      const rasgosQueOtorganDote = nuevosRasgos.filter(r => 
        r.nombre === "Mejora de característica" || r.nombre === "Don épico"
      )
      
      const dotes = dotesActuales || []

      // AUTO-LIMPIEZA: Si se bajó de nivel, borramos las dotes de nivel alto que ya no corresponden
      if (dotes.length > 0) {
        const dotesValidas = dotes.filter(dote => {
          if (dote.tipo !== 'General' && dote.tipo !== 'Don épico') return true // Respetamos origen/raza
          // Comprobamos si el rasgo que la otorgó aún existe
          return rasgosQueOtorganDote.some(r => r.origen === dote.fuente && r.nivel === dote.nivel_adquirido)
        })

        if (dotesValidas.length !== dotes.length) {
          formData.value.dotes = dotesValidas
          return // Salimos para que el watch vuelva a reaccionar con los datos limpios
        }
      }

      // Buscamos qué rasgos aún no tienen su dote reclamada
      const pendientes = rasgosQueOtorganDote.filter(rasgo => {
        return !dotes.some(d => d.fuente === rasgo.origen && d.nivel_adquirido === rasgo.nivel)
      })

      cantidadMejorasPendientes.value = pendientes.length

      if (pendientes.length > 0) {
        const rasgoPendiente = pendientes[0] // Procesamos de una en una
        requiereMejora.value = true
        claseTrigger.value = rasgoPendiente.origen
        nivelTrigger.value = rasgoPendiente.nivel
        tipoFiltroDote.value = rasgoPendiente.nombre === "Don épico" ? "Don épico" : "General"
      } else {
        requiereMejora.value = false
        claseTrigger.value = ''
        nivelTrigger.value = 0
        tipoFiltroDote.value = ''
      }
    },
    { deep: true, immediate: true }
  )

  return {
    rasgosPersonaje,
    requiereMejora,
    cantidadMejorasPendientes,
    claseTrigger,
    nivelTrigger,
    tipoFiltroDote
  }
}