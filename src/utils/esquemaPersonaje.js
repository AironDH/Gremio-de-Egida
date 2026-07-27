/**
 * Función fábrica que devuelve el esquema base (molde) de un personaje.
 * Útil para inicializar nuevos personajes o rellenar campos faltantes por retrocompatibilidad.
 */
export const generarPersonajeBase = () => ({
  id: '',
  nombre: '',
  clases: [
      { nombre: '', nivel: 1, subclase: '' } 
  ],
  especie: '',
  raza: '',
  trasfondo: '',
  tamano: 'mediano',
  exp: 0,
  alineamiento: '',
  estadoPersonaje: '',
  puntosVidaMax: 10,
  puntosVidaActuales: 10,
  pgTemp: 0,
  dadosGolpeActuales: {},
  ca: 10,
  velocidad: 9,
  inspiracion: false,
  estadoPersonalizado: "",
  competenciasArmas: [],
  competenciasArmaduras: [],
  herramientas: [],
  idiomas: [],
  estadosFijos: [],
  modificadoresIniciativa: [],
  dotes: [],
  ataques: [],
  hechizos: [],
  equipo: [
    {
      "id": "c8be5d5a-51eb-4adb-b11c-42217d0e6c10",
      "nombre": "Piezas de Oro",
      "cantidad": 0,
      "peso": 0.01,
      "notas": ""
    }
  ],
  mejoras: [],
  recursosPersonalizados: [],
  recursosMagicos: {
    estandar: {}, 
    pacto: {}     
  },
  opcionesRasgos: {},
  caracteristicasBase: { 
      fuerza: 10, destreza: 10, constitucion: 10, 
      inteligencia: 10, sabiduria: 10, carisma: 10 
  },
  salvaciones: { 
      fuerza: false, destreza: false, constitucion: false, 
      inteligencia: false, sabiduria: false, carisma: false 
  },
  habilidades: { 
      atletismo: 'sin_competencia', acrobacias: 'sin_competencia', 
      juego_de_manos: 'sin_competencia', sigilo: 'sin_competencia', 
      conocimiento_arcano: 'sin_competencia', historia: 'sin_competencia', 
      investigacion: 'sin_competencia', naturaleza: 'sin_competencia', 
      religion: 'sin_competencia', trato_con_animales: 'sin_competencia', 
      medicina: 'sin_competencia', percepcion: 'sin_competencia', 
      perspicacia: 'sin_competencia', supervivencia: 'sin_competencia', 
      intimidacion: 'sin_competencia', interpretacion: 'sin_competencia', 
      persuasion: 'sin_competencia', engano: 'sin_competencia' 
  },
  personalidad: { 
      rasgosPersonalidad: '', ideales: '', vinculos: '', 
      defectos: '', apariencia: '', historia: '' 
  }
})