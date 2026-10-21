import type { Article } from './types'

export const ACTUALIDAD_TRENDING_ARTICLES_BATCH_12: Article[] = [
  {
    id: 831,
    title: 'Vulnerabilidades críticas en PHP: qué versiones actualizar y cómo proteger una web',
    slug: 'vulnerabilidades-php-cve-2026-109618-109619-actualizar',
    category: 'actualidad',
    excerpt: 'PHP ha publicado parches para dos fallos críticos que podrían permitir ejecución remota de código. Versiones corregidas, pasos de actualización y medidas para administradores.',
    image_url: '/images/articles/novedades-tecnologia-2026.svg',
    thumbnail_url: '/images/articles/novedades-tecnologia-2026.svg',
    read_time_minutes: 9, views: 0, trending: 1,
    published_at: '2026-10-21T14:30:00.000Z',
    content: `# Vulnerabilidades críticas en PHP: qué versiones actualizar y cómo proteger una web

El equipo de PHP ha publicado el 21 de octubre de 2026 actualizaciones de seguridad para corregir dos vulnerabilidades críticas identificadas como **CVE-2026-109618** y **CVE-2026-109619**. Los avisos oficiales señalan que los fallos podrían permitir ejecución remota de código sin autenticación en determinados escenarios. Para quien administra una web, la prioridad es identificar qué versión se ejecuta, instalar una versión corregida y comprobar que el cambio ha llegado también a los servidores de producción.

La alerta no significa que todas las páginas web sean vulnerables: afecta a instalaciones que utilizan PHP en versiones no corregidas y cuya configuración está expuesta al escenario correspondiente. Pero como PHP se utiliza en muchos gestores de contenidos y aplicaciones, conviene comprobarlo sin demora en lugar de asumir que el proveedor se encarga automáticamente.

## Qué versiones corregidas ha publicado PHP

El anuncio oficial enumera versiones de mantenimiento que corrigen los fallos en varias ramas mantenidas:

- PHP 8.5.12
- PHP 8.4.27
- PHP 8.3.36
- PHP 8.2.35

La versión apropiada depende de la rama que use cada proyecto. No se debe actualizar a ciegas a una rama mayor ni instalar paquetes descargados de sitios no oficiales. Consulta la página de seguridad de PHP y el sistema de paquetes o panel de alojamiento que utilice tu infraestructura.

El aviso del equipo de PHP considera que el riesgo es especialmente alto en algunas configuraciones de Apache con `mod_php`. Eso no sustituye una revisión técnica de la instalación: el impacto concreto depende de la versión, el modo de ejecución y la configuración del servidor.

## Qué debe hacer una empresa o administrador

### 1. Inventariar las instalaciones

Comprueba la versión efectiva de PHP en todos los entornos: producción, servidores secundarios, contenedores, máquinas virtuales y servicios antiguos. No basta con revisar el portátil de desarrollo o una única web. En plataformas gestionadas, consulta al proveedor qué versión está activa y cuándo se aplicará el parche.

### 2. Aplicar la actualización oficial

Instala la versión corregida correspondiente a tu rama y sigue el procedimiento de despliegue habitual. Hazlo con prioridad, pero verifica previamente las dependencias y el plan de reversión para reducir el riesgo de interrupción. Si una aplicación no puede actualizarse de inmediato, limita temporalmente su exposición a Internet y pide una evaluación a quien administre la infraestructura.

### 3. Verificar que el parche está realmente activo

Después de actualizar, confirma la versión de los procesos que atienden las peticiones, reinicia los servicios cuando sea necesario y comprueba que no quedan nodos antiguos detrás del balanceador. En infraestructuras con imágenes de contenedor, reconstruye y despliega la imagen corregida; actualizar solo el host no cambia necesariamente el PHP que corre dentro del contenedor.

### 4. Revisar indicios de actividad sospechosa

Consulta los registros de servidor, los sistemas de detección y las alertas de seguridad para identificar comportamientos anómalos. No hay que dar por hecho que ha existido una intrusión por el mero hecho de usar una versión vulnerable, pero tampoco asumir que actualizar elimina la necesidad de investigar si existen señales de compromiso.

### 5. Documentar el cierre

Registra las versiones detectadas, los equipos actualizados, la hora del despliegue y cualquier excepción pendiente. Si el servicio lo gestiona un tercero, solicita confirmación por escrito y conserva el registro de la actuación.

## ¿Basta con poner un cortafuegos o desactivar una función?

El equipo de PHP indica que no hay mitigaciones completas que sustituyan la actualización. Las restricciones de red, el aislamiento temporal o el filtrado pueden reducir la exposición mientras se prepara el parche, pero no deben presentarse como una solución equivalente a instalar la versión corregida. Si no puedes parchear un sistema expuesto, valora aislarlo de redes públicas hasta que pueda corregirse.

## ¿Afecta a WordPress, Drupal, Joomla o Magento?

Estos gestores y plataformas pueden ejecutarse sobre PHP, pero la exposición depende de la versión y la configuración de PHP del servidor, no solo del nombre del CMS. Actualizar el núcleo de WordPress o un complemento no garantiza que el intérprete PHP esté corregido. Comprueba la versión del entorno de ejecución en el panel de hosting o con el equipo técnico responsable.

## Preguntas frecuentes

### ¿Qué son CVE-2026-109618 y CVE-2026-109619?
Son identificadores de dos vulnerabilidades críticas de PHP que, según los avisos publicados, pueden permitir ejecución remota de código sin autenticación en escenarios afectados.

### ¿Qué versión debo instalar?
Elige la versión corregida de la misma rama mantenida que utilice tu proyecto: PHP publicó actualizaciones 8.5.12, 8.4.27, 8.3.36 y 8.2.35. Confirma siempre el anuncio oficial antes de desplegar.

### ¿Actualizar PHP puede romper mi web?
Una actualización de mantenimiento puede requerir pruebas de compatibilidad, por lo que conviene probarla y tener un plan de reversión. Sin embargo, una vulnerabilidad crítica exige priorizar la corrección y no aplazarla indefinidamente.

### ¿Qué hago si no puedo actualizar hoy?
Reduce la exposición de la aplicación, restringe el acceso si es posible y contacta con el proveedor o equipo de seguridad. Las medidas temporales no reemplazan el parche.

### ¿Una web vulnerable significa que ha sido atacada?
No necesariamente. La vulnerabilidad indica riesgo, no confirma una intrusión. Actualiza y revisa registros y alertas si existe cualquier indicio de actividad sospechosa.

## Fuentes oficiales y técnicas

- [PHP: aviso de seguridad y versiones corregidas](https://www.php.net/index.php)
- [PHP 8.3.36: anuncio oficial de la versión](https://www.php.net/releases/8_3_36.php)
- [CERT-EU: Security Advisory 2026-018](https://cert.europa.eu/publications/security-advisories/2026-018)
- [Palo Alto Networks Unit 42: análisis de las CVE](https://unit42.paloaltonetworks.com/cve-2026-109618-cve-2026-109619/)

**Nota editorial:** las versiones afectadas y las mitigaciones deben verificarse en los avisos de PHP y CERT-EU, que pueden actualizarse conforme avance el análisis técnico.`
  },
  {
    id: 832,
    title: 'Anthropic pierde 80.700 millones de dólares sobre el papel: qué revelan sus cuentas',
    slug: 'anthropic-perdidas-80700-millones-ingresos-ia-2026',
    category: 'actualidad',
    excerpt: 'El borrador de folleto de Anthropic refleja pérdidas extraordinarias en el primer semestre, en gran parte por ajustes contables, junto con un fuerte crecimiento de ingresos y un enorme gasto en infraestructura.',
    image_url: '/images/articles/novedades-tecnologia-2026.svg',
    thumbnail_url: '/images/articles/novedades-tecnologia-2026.svg',
    read_time_minutes: 8, views: 0, trending: 1,
    published_at: '2026-10-21T14:31:00.000Z',
    content: `# Anthropic pierde 80.700 millones de dólares sobre el papel: qué revelan sus cuentas

Anthropic, la empresa de inteligencia artificial responsable de Claude, aparece en el centro de la actualidad financiera después de que informaciones basadas en un borrador de folleto para una posible salida a Bolsa revelaran pérdidas netas de **80.700 millones de dólares en el primer semestre de 2026**. La cifra impresiona, pero necesita contexto: una parte muy importante no corresponde a dinero gastado en operaciones durante esos seis meses, sino a ajustes contables vinculados al valor de instrumentos de financiación.

La noticia plantea una pregunta más útil que el titular: cómo puede una empresa que aumenta con rapidez sus ingresos registrar pérdidas contables tan elevadas, y qué riesgos aparecen cuando el crecimiento depende de una infraestructura informática muy costosa.

## De dónde salen las pérdidas

Según la información publicada por EL PAÍS a partir del borrador de folleto citado por The Wall Street Journal, alrededor de 72.000 millones de dólares de las pérdidas se explicarían por ajustes no monetarios relacionados con pagarés convertibles y otros instrumentos financieros. Esa distinción es esencial: una pérdida contable puede afectar al resultado declarado sin equivaler a una salida de caja del mismo importe en el periodo.

Esto no significa que el resultado carezca de importancia ni que los costes operativos sean irrelevantes. Los ajustes financieros deben analizarse junto con el gasto en computación, la financiación obtenida, los compromisos futuros y la capacidad de convertir el crecimiento de ingresos en un negocio sostenible. Además, las cifras proceden de un borrador de documentación de una posible OPV, no de unas cuentas anuales auditadas que deban interpretarse sin contexto.

## Los ingresos también crecen con fuerza

El mismo borrador atribuye a Anthropic unos ingresos de 16.300 millones de dólares durante los seis primeros meses de 2026, frente a unos 1.100 millones en el mismo periodo del año anterior. El documento también recoge una tasa anualizada de ingresos superior a 47.000 millones durante el periodo de enero a junio. Son magnitudes distintas: los ingresos semestrales corresponden al periodo indicado, mientras que una cifra anualizada proyecta el ritmo de ingresos si se mantuviera.

El crecimiento, por sí solo, no demuestra rentabilidad. Para evaluar el negocio hay que conocer también los costes de operación, la inversión en infraestructura, la estructura de financiación y la concentración de clientes.

## El coste de competir en inteligencia artificial

La infraestructura de computación es uno de los grandes compromisos de las empresas que desarrollan modelos avanzados. La información publicada señala que Anthropic invirtió cerca de 9.000 millones de dólares en capacidad e infraestructura informática durante el primer semestre de 2026, por encima de su gasto total en infraestructura de 2025.

El borrador también describe importantes compromisos futuros de computación en la nube. Esos acuerdos ayudan a asegurar capacidad para entrenar y servir modelos, pero pueden crear obligaciones financieras duraderas y reducir la flexibilidad si la demanda o los ingresos evolucionan de forma distinta a la prevista.

## La concentración de clientes, otro riesgo

Según la información sobre el folleto, cerca del 20 % de los ingresos de Anthropic procedía de solo dos clientes. Una concentración de ese tipo puede hacer que los resultados dependan en exceso de un número reducido de contratos. Si uno de esos clientes reduce su consumo, cambia de proveedor o renegocia condiciones, el impacto podría ser significativo.

La diversificación de clientes, el coste de atender cada uso y la estabilidad de los contratos serán indicadores importantes para valorar el negocio si la compañía avanza hacia una oferta pública de venta.

## ¿Va a salir Anthropic a Bolsa?

La noticia se conoce en medio de preparativos para una posible salida a Bolsa, pero un borrador de folleto no equivale a una operación completada ni garantiza una fecha, una valoración final o la demanda de los inversores. Los planes, cifras y condiciones pueden cambiar durante el proceso. Las valoraciones que circulan en el mercado deben leerse como expectativas, no como dinero ya recibido ni como precio asegurado.

## Qué debería mirar un inversor

Antes de sacar conclusiones a partir de una cifra aislada, conviene revisar:

- **Pérdidas contables frente a flujo de caja:** qué partidas son no monetarias y cuánto efectivo consume la actividad.
- **Ingresos recurrentes:** cuánto depende de contratos estables y cuánto de consumos puntuales.
- **Coste de computación:** si el gasto crece más rápido o más despacio que los ingresos.
- **Concentración de clientes:** cuánto representan los mayores contratos.
- **Compromisos futuros:** qué pagos y acuerdos de infraestructura son irrevocables.
- **Gobernanza y riesgos de IA:** cómo se gestionan los riesgos operativos, de seguridad y de alineación de modelos.

Nada de esto convierte el borrador en una recomendación de inversión. Las empresas privadas no siempre ofrecen la misma información que una cotizada, y las condiciones de una eventual OPV pueden diferir de las expectativas actuales.

## Preguntas frecuentes

### ¿Anthropic perdió realmente 80.700 millones de dólares en efectivo?
No se puede interpretar así. La información publicada atribuye alrededor de 72.000 millones a ajustes contables no monetarios vinculados a instrumentos financieros. Para conocer el consumo de efectivo hay que revisar el estado de flujos y las demás partidas del folleto.

### ¿Cómo puede crecer la facturación y tener pérdidas?
Los ingresos miden ventas, no beneficios. La empresa puede ingresar más y, al mismo tiempo, soportar costes de computación, personal, investigación, financiación y ajustes contables muy elevados.

### ¿La salida a Bolsa está confirmada?
La información disponible se refiere a preparativos y a un borrador de folleto. No debe presentarse como una OPV completada ni darse por garantizados su fecha y valoración.

### ¿Qué riesgo representa depender de pocos clientes?
Una concentración alta puede hacer que los ingresos sean más sensibles a la pérdida o reducción de contratos importantes. Es uno de los indicadores que conviene seguir junto con los márgenes y el coste de infraestructura.

## Fuentes

- [EL PAÍS: las pérdidas de Anthropic antes de su posible salida a Bolsa](https://elpais.com/economia/2026-10-20/anthropic-registra-unas-perdidas-historicas-de-80000000000-millones-de-dolares-antes-de-su-salida-a-bolsa.html)
- [Europa Press: pérdidas de Anthropic en el primer semestre de 2026](https://www.europapress.es/economia/noticia-anthropic-perdio-casi-72000-millones-primera-mitad-2026-20261021113424.html)

**Nota editorial:** las cifras proceden de información periodística sobre un borrador de folleto. Deben actualizarse si se publica documentación oficial posterior o si cambian los planes de la empresa.`
  },
  {
    id: 833,
    title: 'Ayudas por los incendios de Extremadura: qué recoge el decreto publicado en el BOE',
    slug: 'ayudas-incendios-extremadura-2026-decreto-boe-requisitos',
    category: 'actualidad',
    excerpt: 'El BOE publica el decreto extremeño de ayudas para recuperar zonas afectadas por los incendios del verano de 2026. Repasamos los sectores afectados, los daños contemplados y cómo comprobar los requisitos.',
    image_url: '/images/articles/novedades-tecnologia-2026.svg',
    thumbnail_url: '/images/articles/novedades-tecnologia-2026.svg',
    read_time_minutes: 8, views: 0, trending: 1,
    published_at: '2026-10-21T14:32:00.000Z',
    content: `# Ayudas por los incendios de Extremadura: qué recoge el decreto publicado en el BOE

El Boletín Oficial del Estado ha publicado el 21 de octubre de 2026 el **Decreto-ley 5/2026, de 1 de septiembre**, de Extremadura, que establece ayudas extraordinarias y otras medidas para recuperar las zonas afectadas por los incendios forestales del verano y reforzar la prevención. La publicación oficial permite consultar el texto completo, pero no significa que todas las ayudas se concedan automáticamente ni que exista un único procedimiento para todos los afectados.

La norma describe daños en zonas forestales y agrarias, explotaciones agrícolas, ganaderas y apícolas, actividades turísticas, empresas y viviendas. Entre los episodios mencionados figura el incendio de la comarca de Las Hurdes, que afectó aproximadamente a 3.700 hectáreas, y el de Casas de Millán, con unas 1.035 hectáreas afectadas.

## Qué zonas y actividades contempla

El decreto se centra en los daños asociados a los incendios forestales ocurridos en Extremadura durante el verano de 2026. La exposición de motivos menciona pérdidas de producción agraria, muerte de ganado, daños en colmenas, afectación a viviendas e instalaciones complementarias, además de consecuencias para negocios y actividad turística.

La inclusión de un sector en el texto no implica que cualquier persona o empresa de ese sector tenga derecho a cobrar. La elegibilidad dependerá de los requisitos establecidos en los artículos correspondientes, la ubicación y naturaleza del daño, la documentación acreditativa y, cuando proceda, la compatibilidad con otras ayudas.

## Cómo comprobar si puedes solicitar una ayuda

Antes de presentar una solicitud, sigue estos pasos:

1. **Consulta el texto íntegro.** Lee el Decreto-ley 5/2026 en el BOE y localiza la línea de ayuda que corresponde a tu situación.
2. **Verifica el ámbito territorial.** Comprueba si el municipio, finca, explotación o inmueble está incluido en los supuestos previstos.
3. **Reúne pruebas del daño.** Conserva fotografías fechadas, informes técnicos, facturas, inventarios, registros de explotación y comunicaciones de los servicios de emergencia cuando existan.
4. **Comprueba plazos y órgano competente.** Cada procedimiento puede tener una administración responsable y un plazo específico; no debe suponerse que todos comparten la misma fecha límite.
5. **Pregunta por la compatibilidad.** Si has recibido ayudas de seguros u otras administraciones, revisa las reglas sobre acumulación para evitar errores o reintegros.
6. **Guarda el justificante.** Conserva la copia de la solicitud, el número de registro y cualquier requerimiento que recibas.

Estos pasos son una guía de comprobación, no una confirmación de elegibilidad. Si el texto remite a una convocatoria, formulario o desarrollo posterior, habrá que seguir también esas instrucciones.

## Qué daños aparecen en la norma

El texto describe consecuencias para explotaciones agrarias y ganaderas, colmenas, viviendas, infraestructuras rurales y actividades económicas de las zonas afectadas. También incluye medidas de recuperación y prevención de incendios. Para conocer las cuantías, las personas beneficiarias y los documentos exigidos, es necesario consultar los artículos específicos y sus anexos, no basarse únicamente en la descripción general.

Las cifras de superficie afectada recogidas en la exposición de motivos sirven para explicar la dimensión de algunos incendios, pero no determinan por sí solas la cuantía de una ayuda individual.

## ¿La publicación en el BOE abre automáticamente el plazo?

No necesariamente. La publicación hace accesible la norma, pero el inicio y la duración de cada plazo dependen de las disposiciones aplicables y de las convocatorias o trámites que correspondan. Antes de dar por abierto un plazo, comprueba el articulado, las disposiciones finales y la información actualizada de la Junta de Extremadura.

## Preguntas frecuentes

### ¿Qué norma se ha publicado?
El Decreto-ley 5/2026, de 1 de septiembre, sobre ayudas extraordinarias y medidas urgentes para recuperar zonas afectadas por incendios forestales en Extremadura durante el verano de 2026 y sobre prevención de incendios.

### ¿Quién puede beneficiarse?
El decreto contempla daños en sectores como agricultura, ganadería, apicultura, turismo, empresas y viviendas, pero cada línea puede establecer condiciones concretas. Hay que verificar el supuesto y la documentación exigida.

### ¿Qué documentos conviene guardar?
Pruebas del daño, fotografías, informes, facturas, registros de actividad y justificantes administrativos. La documentación definitiva depende de cada procedimiento.

### ¿Dónde se consulta el texto oficial?
En la ficha del decreto publicada por el BOE, que enlaza al texto original completo.

### ¿Puedo contar con una cuantía fija?
No debe asumirse una cantidad universal. Las cuantías y condiciones se determinan en el articulado y en los procedimientos aplicables a cada ayuda.

## Fuentes oficiales

- [BOE: Decreto-ley 5/2026, de 1 de septiembre, de Extremadura](https://www.boe.es/buscar/doc.php?id=BOE-A-2026-21876)
- [Junta de Extremadura](https://www.juntaex.es/)

**Nota editorial:** antes de solicitar una ayuda, verifica los artículos concretos, los plazos y las instrucciones administrativas vigentes. Este artículo no sustituye la lectura del texto oficial ni una resolución de elegibilidad.`
  }
]
