# Especialización de TrendiVerse en astrología

Esta primera entrega amplía el horóscopo semanal con una biblioteca permanente. El objetivo es desarrollar profundidad y conexiones entre contenidos, no generar muchas páginas intercambiables ni prometer un crecimiento SEO exponencial.

## Implementado en esta entrega

- **Biblioteca:** seis guías de ascendente, signo lunar, carta natal, eclipses, fases de la Luna y Mercurio retrógrado.
- **Rutas:** `/astrologia/guias` y `/astrologia/guias/{tema}`, sin cambiar las URLs de las lecturas semanales.
- **Navegación:** enlaces desde la portada de astrología, cada lectura semanal y la guía del método; índice dentro de cada artículo y tres lecturas relacionadas.
- **SEO:** títulos y descripciones propios, canónicas, sitemap y datos estructurados coherentes con el texto visible.
- **Criterio editorial:** referencias junto a las afirmaciones, identificación de la interpretación simbólica y límites cuando faltan datos de nacimiento.

## Próximas capas editoriales, todavía no implementadas

### Interpretación por signo

- **Ascendentes:** doce artículos con ejemplos, diferencias respecto al signo solar, papel del resto de la carta y límites de las generalizaciones.
- **Lunas natales:** doce artículos sobre simbolismo, sin diagnósticos ni atribuciones causales sobre emociones.
- **Sol, Luna y ascendente:** comparaciones razonadas de combinaciones seleccionadas por intención real de búsqueda; no producir automáticamente todas las combinaciones.

Cada artículo deberá aportar ejemplos y preguntas diferentes, no un texto reutilizado cambiando el nombre del signo. Las referencias sobre las tradiciones no validan científicamente sus afirmaciones.

### Conceptos y técnicas

- **Casas:** qué representan y cómo cambian las divisiones según el sistema utilizado.
- **Aspectos:** conjunción, oposición, cuadratura, trígono y sextil, separando medidas angulares y simbolismo.
- **Zodiacos:** marco tropical y sideral, sin confundir signos con constelaciones.
- **Relaciones:** sinastría y sus límites, sin porcentajes inventados de compatibilidad.

### Contenido fechado

- **Calendarios lunares:** eventos verificados por mes, instantes con zona horaria explícita y observación local diferenciada.
- **Eclipses:** fichas con fecha, tipo, mapa de visibilidad y seguridad; la interpretación debe quedar en una sección distinta.
- **Retrogradaciones:** fuente, periodo, zona horaria y distinción entre movimiento aparente y etiquetas interpretativas.

No cambiar el año de una guía para aparentar una actualización. Cada calendario requiere comprobar sus eventos y dejar trazabilidad de la revisión.

## Calculadora natal: requisitos antes de construirla

No está incluida en esta entrega. Solo se planteará con un motor contrastado, licencia compatible y pruebas contra resultados de referencia.

- **Datos:** fecha, hora local y localidad; zona horaria histórica y horario de verano, no el desfase actual.
- **Incertidumbre:** hora desconocida o aproximada, cambios de signo dentro de una franja y restricciones a ascendente y casas.
- **Configuración:** zodiaco y sistema de casas explícitos; evitar resultados ambiguos o supuestas posiciones obtenidas por afinidad.
- **Pruebas:** cambios de día, transiciones de horario de verano, localidades con el mismo nombre y latitudes problemáticas.
- **Privacidad:** no guardar ni transmitir datos de nacimiento innecesariamente; indicar qué procesamiento ocurre y dónde.

## Criterios de publicación

- **Fuentes científicas:** se usan para fenómenos astronómicos y seguridad, no para respaldar interpretaciones. Ejemplos: [NASA sobre eclipses](https://science.nasa.gov/moon/eclipses/) y [seguridad de observación](https://science.nasa.gov/eclipses/safety/).
- **Referencias astrológicas:** documentan términos y métodos de esa tradición. Ejemplos: [ascendente en Astrodienst](https://www.astro.com/astrowiki/en/Ascendant) y [hora de nacimiento](https://www.astro.com/faq/fq_de_time_e.htm).
- **Evidencia:** no presentar predicciones de acontecimientos o personalidad como científicamente verificadas; véase [Understanding Science, Universidad de California](https://undsci.berkeley.edu/astrology-is-it-scientific/).
- **Autoría:** Equipo Editorial, sin inventar expertos, credenciales ni revisión profesional.
- **Seguridad:** sin diagnósticos, miedo, instrucciones de inversión o urgencia para comprar soluciones.
- **Lenguaje:** natural en las lecturas; términos técnicos definidos en las guías, no eliminados cuando son necesarios para explicar el método.

## Medición y mantenimiento

Medir en Search Console impresiones, clics y consultas por grupos de URLs: semanal, ascendente, lunar, carta y cielo. Mantener tipos de búsqueda, países y periodos comparables; analizar 7 y 28 días sin asumir que la demanda genérica de Google Trends equivale al rendimiento del sitio.

Priorizar ampliaciones según consultas observadas y preguntas que las guías actuales no responden. Las FAQs estructuradas no garantizan un resultado enriquecido, y ni el sitemap ni el volumen de publicaciones garantizan indexación o posicionamiento.

## Inventario de verificación de esta entrega

- **Portada:** un H1, acceso al horóscopo y a la biblioteca, anclas sin quedar tapadas por la cabecera.
- **Seis guías:** respuesta breve, lectura completa, fuentes, índice, FAQs desplegables, enlaces relacionados y regreso al horóscopo.
- **Lecturas semanales:** URLs y fechas intactas, enlaces a las guías, último día correctamente expresado.
- **SEO:** títulos, descripciones, canónicas, JSON-LD y sitemap; tema o signo inexistente devuelve 404.
- **Pantallas:** escritorio y móvil, temas claro y oscuro, sin desbordamiento horizontal.
- **Casos fuera del recorrido principal:** hora natal desconocida explicada sin resultado fabricado y acceso a una guía inexistente.
