import { computed } from 'vue'
import { calcularPB, calcularModificador, calcularNivelTotal } from '../utils/calculations.js'
import datosMundo from '../data/data.json' // Importamos los datos estáticos para cruzar la información

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
  // 1. Estado Derivado: Salvaciones de Clase Principal
  // ==========================================
  const salvacionesClasePrincipal = computed(() => {
    const clases = personajeRef.value.clases || []
    
    // Cláusula de salvaguarda por si el formulario está vacío
    if (clases.length === 0 || !clases[0].nombre) return []

    const nombreClasePrincipal = clases[0].nombre
    const claseData = datosMundo.clases?.find(c => c.nombre === nombreClasePrincipal)

    if (!claseData || !Array.isArray(claseData.competencia_salvacion)) return []

    // Normalizamos las strings para quitar acentos y pasarlas a minúsculas (ej: "Constitución" -> "constitucion")
    return claseData.competencia_salvacion.map(salvacion => {
      return salvacion.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    })
  })

  // ==========================================
  // 2. useSalvaciones
  // ==========================================
  const salvacionesCalculadas = computed(() => {
    const resultado = {}
    const caracteristicas = personajeRef.value.caracteristicasBase || {}
    const salvacionesProf = personajeRef.value.salvaciones || {}
    const salvacionesFijas = salvacionesClasePrincipal.value

    // Modificador de característica + PB (si es competente por dote o por clase principal)
    for (const [caracteristica, valor] of Object.entries(caracteristicas)) {
      let modTotal = calcularModificador(valor)
      
      if (salvacionesProf[caracteristica] || salvacionesFijas.includes(caracteristica)) {
        modTotal += pb.value
      }
      
      resultado[caracteristica] = modTotal
    }
    
    return resultado
  })

  // ==========================================
  // 3. useHabilidades
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
  // 4. useCombate
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

  // ==========================================
  // 5. Inventario y Carga
  // ==========================================
  const pesoActualEquipado = computed(() => {
    const equipo = personajeRef.value.equipo || []
    return equipo.reduce((total, item) => {
      const peso = parseFloat(item.peso) || 0
      const cantidad = parseInt(item.cantidad) || 0
      return total + (peso * cantidad)
    }, 0)
  })

  const capacidadCargaCalculada = computed(() => {
    const caracteristicas = personajeRef.value.caracteristicasBase || {}
    const fuerza = caracteristicas.fuerza || 10
    const tamano = personajeRef.value.tamano || 'mediano'
    
    // Base de capacidad (Fuerza * 7.5 kg)
    const capacidadBase = fuerza * 7.5
    
    // Multiplicador por tamaño
    let multiplicador = 1
    switch(tamano.toLowerCase()) {
      case 'diminuto': multiplicador = 0.5; break;
      case 'pequeño':
      case 'pequeno':
      case 'mediano': multiplicador = 1; break;
      case 'grande': multiplicador = 2; break;
      case 'enorme': multiplicador = 4; break;
      case 'gargantuesco': multiplicador = 8; break;
      default: multiplicador = 1; break;
    }

    return capacidadBase * multiplicador
  })

  // ==========================================
  // 6. Salud y Dados de Golpe (NUEVO)
  // ==========================================
  const dadosGolpeMaximos = computed(() => {
    const clasesPersonaje = personajeRef.value.clases || []
    const dadosAgrupados = {}

    clasesPersonaje.forEach(clase => {
      if (clase.nombre && clase.nivel > 0) {
        // Busca la clase en el listado estático
        const claseData = datosMundo.clases?.find(c => c.nombre === clase.nombre)
        
        if (claseData && claseData.dado_golpe) {
          const tipoDado = claseData.dado_golpe // ej: "d12"
          const nivel = parseInt(clase.nivel) || 1
          
          // Suma los dados si ya existe la clave, o la inicializa
          if (dadosAgrupados[tipoDado]) {
            dadosAgrupados[tipoDado] += nivel
          } else {
            dadosAgrupados[tipoDado] = nivel
          }
        }
      }
    })

    return dadosAgrupados
  })

  // Funciones auxiliares para formateo en la interfaz
  const formatearModificador = (valor) => {
    return valor >= 0 ? `+${valor}` : `${valor}`
  }

  return {
    nivelTotal,
    pb,
    salvacionesClasePrincipal, 
    salvacionesCalculadas,
    habilidadesCalculadas,
    combateCalculado,
    pesoActualEquipado,      
    capacidadCargaCalculada,
    dadosGolpeMaximos, // <-- NUEVA EXPORTACIÓN 
    formatearModificador
  }
}