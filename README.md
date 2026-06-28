# Gestor Dinámico de Personajes D&D 5e

## Descripción General

Esta aplicación es una hoja de personaje digital, interactiva y reactiva diseñada para Dungeons & Dragons 5ª Edición. Construida utilizando **Vue 3 (Composition API)**, su objetivo es automatizar y simplificar la gestión de la ficha del personaje durante las partidas, permitiendo a los jugadores centrarse en el rol y el combate sin preocuparse por llevar la cuenta manual de sus recursos.

La arquitectura está basada en componentes modulares que se comunican a través de un estado centralizado (`formData`), garantizando que los cálculos de estadísticas, puntos de vida, espacios de conjuro y estados alterados se actualicen en tiempo real.

---

## Características Principales

* **Gestión de Clases y Multiclase:** Soporte para múltiples clases y subclases, calculando automáticamente el Nivel Total y el Bonificador de Competencia. Incluye gestión de especies, linajes, tamaños y trasfondos con integración de dotes adicionales (ej. razas versátiles).
* **Salud y Descansos (`CharacterHealth`):**
* Control de Puntos de Golpe (Máximos, Actuales y Temporales).
* Gestión de Dados de Golpe por clase, con botones para consumirlos.
* Sistema de "Descanso" que restablece automáticamente la salud, los dados de golpe y limpia los estados alterados mecánicos.


* **Estados Alterados Dinámicos:**
* Interfaz compacta con iconos visuales para los estados activos.
* Catálogo modal (basado en `estados.json`) para añadir/quitar estados como *Cegado*, *Hechizado*, o niveles de *Agotamiento*.
* Tooltips interactivos que muestran las reglas exactas de cada estado sin salir de la vista principal.
* Campo de texto libre para efectos o maldiciones personalizadas a discreción del DM.


* **Libro de Hechizos Avanzado (`CharacterSpells`):**
* Buscador y filtro interactivo integrado en un modal que lee desde `hechizos.json`.
* Filtrado automático por la clase del personaje, con opción de anular el filtro para hechizos obtenidos por dotes.
* Visualización en cuadrícula responsiva, separada por niveles de conjuro.
* Control de hechizos preparados (omitiendo automáticamente los Trucos).
* Tooltips completos con tiempo de casteo, componentes, alcance, duración y descripción mecánica del conjuro.


* **Automatización de Estadísticas y Combate:** Cálculos reactivos de CA, Iniciativa, Salvaciones, Habilidades, Capacidad de Carga y Recursos Mágicos (Espacios Estándar y de Pacto).

---

## Arquitectura y Componentes Clave

El flujo de datos se orquesta principalmente desde el componente padre **`CharacterForm.vue`**, el cual mantiene el objeto `formData` y lo distribuye a los componentes hijos mediante `v-model` y `props`.

### Árbol Principal

* `CharacterForm.vue`: Contenedor principal y gestor del estado global y guardado.
* `CharacterBasicInfo.vue`: Datos de identidad, clases, especies y trasfondos.
* `CharacterHealth.vue`: Vida, dados de golpe, descansos y estados alterados.
* `CharacterSpells.vue`: Libro de conjuros conocidos/preparados.
* `CharacterStats.vue` & `CharacterSkills.vue`: Atributos base y competencias.
* `CharacterResources.vue`: Slots de magia y recursos de clase.
* `CharacterEquipment.vue`: Inventario y peso.
* `CharacterAttacks.vue`: Armas y ataques.



---

## Fuentes de Datos (JSON)

La aplicación es completamente "Data-Driven". Las reglas mecánicas se extraen de archivos locales, facilitando la expansión del contenido (homebrew) sin tocar el código fuente:

* `src/data/data.json`: Contiene las clases, subclases, especies, linajes, trasfondos y dotes.
* `src/data/hechizos.json`: Base de datos completa de conjuros con sus descripciones y filtros por clase.
* `src/data/estados.json`: Definición mecánica, nombre e iconos (`assets/images/icons/`) de las condiciones del juego.
* `src/data/espacios-conjuro.json`: Tablas de progresión para los slots de magia por nivel y clase.

---

## Interfaz y Experiencia de Usuario (UX)

* **Responsive Design:** Utiliza `CSS Flexbox` y `CSS Grid` de manera extensiva. Las pantallas grandes aprovechan un diseño de hasta 4 columnas, mientras que en dispositivos móviles los paneles colapsan hacia abajo de forma fluida.
* **Lectura Limpia:** Minimización de texto estático mediante el uso de modales, acordeones y directivas de tooltips (`v-outside-click`).
* **Prevención de Errores:** Botones condicionalmente deshabilitados (ej. no se pueden consumir dados de golpe si el contador está a 0).

---

## Configuración y Despliegue

Asegúrate de tener [Node.js](https://nodejs.org/) instalado.

**1. Instalar dependencias**

```bash
npm install

```

**2. Compilar y recargar en caliente para el desarrollo**

```bash
npm run dev

```

**3. Compilar y minificar para producción**

```bash
npm run build

```