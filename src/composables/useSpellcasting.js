/**
 * Gestiona el cálculo de espacios de conjuro estándar y de magia de pacto.
 * @param {Object} formData - Referencia reactiva al modelo del personaje.
 * @param {Object} datosMundo - Datos estáticos (data.json) cargados desde el store.
 * @param {Object} espaciosConjuro - Datos estáticos (espacios-conjuro.json).
 */

import { computed } from 'vue'

export function useSpellcasting(formData, datosMundo, espaciosConjuro) {
  
  // ==========================================
  // 1. EXTRACTOR DEL TIPO DE CONJURADOR
  // ==========================================
  const obtenerTipoConjurador = (clasePj) => {
    if (!clasePj || !clasePj.nombre) return 'ninguno'
    
    // Desempaquetamos los valores en caso de venir como refs
    const datosGenerales = datosMundo?.value || datosMundo
    const claseData = datosGenerales.clases?.find(c => c.nombre === clasePj.nombre)
    
    if (!claseData) return 'ninguno'

    // Si la clase base es conjuradora desde nivel 1 (no es "ninguno"), ignoramos la subclase
    if (claseData.tipo_conjurador && claseData.tipo_conjurador !== 'ninguno') {
      return claseData.tipo_conjurador
    }

    // Si la clase base es "ninguno", buscamos si la subclase le otorga magia (Ej. Caballero Arcano)
    if (clasePj.subclase && Array.isArray(claseData.subclases)) {
      const subclaseData = claseData.subclases.find(sc => sc.nombre === clasePj.subclase)
      if (subclaseData && subclaseData.tipo_conjurador) {
        return subclaseData.tipo_conjurador
      }
    }

    return 'ninguno'
  }

  // ==========================================
  // 2. CÁLCULO DE MAGIA ESTÁNDAR
  // ==========================================
  const espaciosEstandar = computed(() => {
    const personaje = formData?.value || formData
    const dbEspacios = espaciosConjuro?.value || espaciosConjuro
    
    if (!personaje.clases || !dbEspacios) return {}

    let casterCount = 0
    let singleCasterType = null
    let singleCasterLevel = 0
    let nivelEfectivoMulticlase = 0

    personaje.clases.forEach(clase => {
      const tipo = obtenerTipoConjurador(clase)
      const nivel = parseInt(clase.nivel, 10) || 1

      if (['completo', 'medio', 'medio-bonus', 'tercio'].includes(tipo)) {
        casterCount++
        singleCasterType = tipo
        singleCasterLevel = nivel 

        // Acumulación matemática del Nivel Efectivo para Multiclases
        if (tipo === 'completo') nivelEfectivoMulticlase += nivel
        if (tipo === 'medio') nivelEfectivoMulticlase += Math.floor(nivel / 2)
        if (tipo === 'medio-bonus') nivelEfectivoMulticlase += Math.ceil(nivel / 2)
        if (tipo === 'tercio') nivelEfectivoMulticlase += Math.floor(nivel / 3)
      }
    })

    // Resolución de la tabla
    if (casterCount === 0) {
      return {} // No tiene espacios mágicos
    } else if (casterCount === 1) {
      // Conjurador único: respeta milimétricamente la progresión de su propia tabla
      const tabla = dbEspacios[singleCasterType]?.niveles
      return tabla ? (tabla[singleCasterLevel] || {}) : {}
    } else {
      // Multiclase de conjuradores: utiliza la tabla de progresión general ('completo')
      const tabla = dbEspacios['completo']?.niveles
      return tabla ? (tabla[nivelEfectivoMulticlase] || {}) : {}
    }
  })

  // ==========================================
  // 3. CÁLCULO DE MAGIA DE PACTO
  // ==========================================
  const espaciosPacto = computed(() => {
    const personaje = formData?.value || formData
    const dbEspacios = espaciosConjuro?.value || espaciosConjuro
    
    if (!personaje.clases || !dbEspacios) return {}

    let nivelPacto = 0

    // Iteramos de nuevo para independizar por completo los niveles de Brujo
    personaje.clases.forEach(clase => {
      const tipo = obtenerTipoConjurador(clase)
      const nivel = parseInt(clase.nivel, 10) || 1

      if (tipo === 'pacto') {
        nivelPacto += nivel
      }
    })

    if (nivelPacto === 0) return {}

    const tabla = dbEspacios['pacto']?.niveles
    return tabla ? (tabla[nivelPacto] || {}) : {}
  })

  return {
    espaciosEstandar,
    espaciosPacto
  }
}