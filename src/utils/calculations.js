/**
 * Módulo de cálculos puros para la hoja de personaje
 */

/**
 * Calcula el Bonificador de Competencia (PB) basado en el nivel total.
 * Fórmula: +2 para niveles 1-4, +3 para 5-8, +4 para 9-12, +5 para 13-16, +6 para 17-20.
 * @param {number} nivel - Nivel total del personaje.
 * @returns {number} El bonificador de competencia.
 */
export const calcularPB = (nivel) => {
  if (nivel < 1) return 0;
  return Math.ceil(nivel / 4) + 1;
};

/**
 * Calcula el modificador de una característica.
 * Fórmula: redondeo hacia abajo de (valor - 10) / 2.
 * @param {number} valor - Valor de la característica (ej. 16).
 * @returns {number} El modificador (ej. 3).
 */
export const calcularModificador = (valor) => {
  return Math.floor((valor - 10) / 2);
};

/**
 * Calcula el nivel total sumando los niveles individuales de cada clase.
 * @param {Array} clases - Array de objetos clase: { nombre: string, nivel: number }.
 * @returns {number} Suma total de niveles.
 */
export const calcularNivelTotal = (clases) => {
  if (!Array.isArray(clases)) return 0;
  return clases.reduce((total, clase) => total + (parseInt(clase.nivel) || 0), 0);
};