import { computed } from 'vue'
import { calcularPB, calcularModificador, calcularNivelTotal } from '../utils/calculations.js'

// Mapa constante que vincula cada una de las 18 habilidades con su característica base
const MAPA_HABILIDADES = {
  atletismo: 'fuerza',
  acrobacias: 'destreza',
  juego_de_manos: 'destreza',
  sigilo: 'destreza',
  conocimiento_arcano: 'inteligencia',
  historia: 'inteligencia',
  investigacion: 'inteligencia',
  naturaleza: 'inteligencia',
  religion: 'inteligencia',
  trato_con_animales: 'sabiduria',
  medicina: 'sabiduria',
  percepcion: 'sabiduria',
  perspicacia: 'sabiduria',
  supervivencia: 'sabiduria',
  intimidacion: 'carisma',
  interpretacion: 'carisma',
  persuasion: 'carisma',
  engano: 'carisma'
}

/**
 * Composable que encapsula la lógica reactiva de los cálculos del personaje.
 * @param {Object} personajeRef - Referencia reactiva al objeto del personaje (formData).
 */
export function useCharacterCalculations(personajeRef) {
  
  // Nivel total y Bonificador de Competencia (PB) calculados en tiempo real
  const nivelTotal = computed(() => calcularNivelTotal(personajeRef.value.clases || []))
  const pb = computed(() => calcularPB(nivelTotal.value))

  // ==========================================
  // 1. useSalvaciones
  // ==========================================
  const salvacionesCalculadas = computed(() => {
    const resultado = {}
    const caracteristicas = personajeRef.value.caracteristicasBase || {}
    const salvacionesProf = personajeRef.value.salvaciones || {}

    // Modificador de característica + PB (si es competente) 
    for (const [caracteristica, valor] of Object.entries(caracteristicas)) {
      let modTotal = calcularModificador(valor)
      
      if (salvacionesProf[caracteristica]) {
        modTotal += pb.value
      }
      
      resultado[caracteristica] = modTotal
    }
    
    return resultado
  })

  // ==========================================
  // 2. useHabilidades
  // ==========================================
  const habilidadesCalculadas = computed(() => {
    const resultado = {}
    const caracteristicas = personajeRef.value.caracteristicasBase || {}
    const habilidadesProf = personajeRef.value.habilidades || {}

    for (const [habilidad, grado] of Object.entries(habilidadesProf)) {
      const caracteristicaBase = MAPA_HABILIDADES[habilidad]
      const valorCaracteristica = caracteristicas[caracteristicaBase] || 10
      let modTotal = calcularModificador(valorCaracteristica)

      // Se aplica el multiplicador según el grado de competencia
      if (grado === 'competencia') {
        modTotal += pb.value
      } else if (grado === 'pericia') {
        modTotal += (pb.value * 2)
      } else if (grado === 'media_competencia') {
        modTotal += Math.floor(pb.value / 2)
      }
      
      resultado[habilidad] = {
        modificadorTotal: modTotal,
        caracteristicaBase: caracteristicaBase
      }
    }
    
    return resultado
  })

  // ==========================================
  // 3. useCombate
  // ==========================================
  const combateCalculado = computed(() => {
    const caracteristicas = personajeRef.value.caracteristicasBase || {}
    const destreza = caracteristicas.destreza || 10
    const modDestreza = calcularModificador(destreza)

    // Base de iniciativa ligada a Destreza
    let iniciativaTotal = modDestreza
    
    // Sumamos los modificadores adicionales si existen
    const modificadoresExtra = personajeRef.value.modificadoresIniciativa || []
    
    modificadoresExtra.forEach(mod => {
      if (mod === 'medio_pb') iniciativaTotal += Math.floor(pb.value / 2)
      if (mod === 'pb') iniciativaTotal += pb.value
      if (mod === 'inteligencia') iniciativaTotal += calcularModificador(caracteristicas.inteligencia || 10)
      if (mod === 'sabiduria') iniciativaTotal += calcularModificador(caracteristicas.sabiduria || 10)
      if (mod === 'carisma') iniciativaTotal += calcularModificador(caracteristicas.carisma || 10)
    })

    return {
      iniciativa: iniciativaTotal,
      ca: personajeRef.value.ca || (10 + modDestreza),
      velocidad: personajeRef.value.velocidad || 30,
      pb: pb.value
    }
  })

  // Funciones auxiliares para formateo en la interfaz
  const formatearModificador = (valor) => {
    return valor >= 0 ? `+${valor}` : `${valor}`
  }

  return {
    nivelTotal,
    pb,
    salvacionesCalculadas,
    habilidadesCalculadas,
    combateCalculado,
    formatearModificador
  }
}