import type { Article, Deal, Tool } from './types'

const day = 86400000
const iso = (ago: number) => new Date(Date.now() - ago * day).toISOString()
const img = (s: string, thumb = false) => `/images/articles/${s}${thumb ? '-thumb' : ''}.svg`

const a = (
  id: number, title: string, slug: string, category: string, excerpt: string,
  seed: string, read: number, views: number, trending: number, content?: string
): Article => ({
  id, title, slug, category, excerpt, content: content ?? excerpt + ' ' + excerpt,
  image_url: img(seed), thumbnail_url: img(seed, true),
  read_time_minutes: read, views, trending, published_at: iso(id / 4),
})

const chollosOtonoContent = `<h2>Introducción: La Gran Temporada del Ahorro Tecnológico de Otoño</h2>
<p>El último trimestre del año se ha consolidado como el periodo más importante para el comercio electrónico global y nacional. Tradicionalmente, las compras navideñas concentraban las mayores decisiones de consumo; sin embargo, la evolución de los hábitos de compra digitales y la consolidación de eventos como los <strong>Días de Ofertas de Otoño</strong> y las <strong>campañas Pre-Black Friday</strong> han adelantado la ventana de ahorro a los meses de octubre y noviembre.</p>

<p>Para los consumidores exigentes y los entusiastas de la tecnología, esta etapa representa una oportunidad idónea para renovar dispositivos, equipar el hogar con electrónica de vanguardia o adelantar las compras festivas sin sufrir las subidas de precio de última hora ni los habituales problemas de stock. Sin embargo, en un entorno saturado de promociones, no todos los descuentos anunciados representan un ahorro real.</p>

<p>En esta guía exhaustiva de <strong>Trendiverse</strong>, desglosamos las principales campañas de ofertas de la temporada, analizamos las categorías con mayores bajadas de precio reales y te proporcionamos herramientas analíticas para verificar chollos y evitar trampas publicitarias.</p>

<hr />

<h2>1. Calendario de Ofertas de Otoño y Pre-Black Friday 2026</h2>
<p>Para aprovechar al máximo las promociones, es fundamental conocer las fechas clave en las que las grandes plataformas de comercio electrónico activan sus mayores agresiones comerciales.</p>

<table>
  <thead>
    <tr>
      <th>Evento Comercial</th>
      <th>Fechas Aproximadas</th>
      <th>Plataformas Principales</th>
      <th>Categorías Destacadas</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Fiesta de Ofertas de Otoño</strong></td>
      <td>Principios / Mitad de Octubre</td>
      <td>Amazon, PcComponentes</td>
      <td>Dispositivos propios, Domótica, Informática</td>
    </tr>
    <tr>
      <td><strong>Semanas del Electrón (Pre-BF)</strong></td>
      <td>Finales de Octubre / Inicio de Noviembre</td>
      <td>MediaMarkt, El Corte Inglés</td>
      <td>Televisores, Imagen y Sonido, Gran Electrodoméstico</td>
    </tr>
    <tr>
      <td><strong>Día del Soltero (11.11)</strong></td>
      <td>11 de Noviembre</td>
      <td>AliExpress, Miravia, Ebay</td>
      <td>Gadgets, Componentes PC, Telefonía china</td>
    </tr>
    <tr>
      <td><strong>Semana Black Friday</strong></td>
      <td>Tercera semana de Noviembre</td>
      <td>Todas las grandes superficies</td>
      <td>Gaming, Consolas, Smartphones gama alta</td>
    </tr>
  </tbody>
</table>

<p>Planificar las compras en función de este calendario permite distribuir el presupuesto y comparar la evolución de precios entre los diferentes eventos sin caer en compras impulsivas.</p>

<hr />

<h2>2. Las Mejores Categorías de Chollos en Tecnología y Gaming</h2>

<p>Durante las campañas de otoño, no todos los productos experimentan el mismo nivel de descuento. La rotación de catálogo y la llegada de nuevos modelos a final de año provocan desplomes significativos en categorías muy concretas.</p>

<h3>A. Smartphones y Dispositivos Móviles</h3>
<p>Con la presentación de los nuevos buques insignia a finales de verano y principios de otoño, los modelos de la generación anterior sufren rebajas directas de entre un 20% y un 35%. Es el momento óptimo para adquirir terminales de gama alta previa o dispositivos de gama media equilibrados que satisfacen las necesidades de la inmensa mayoría de usuarios.</p>

<h3>B. Hardware Gaming y Consolas</h3>
<p>El sector del videojuego vive una auténtica edad de oro en promociones otoñales. Los packs de consolas (*bundles*) con títulos clave del año, los mandos pro, la memoria de almacenamiento SSD de alta velocidad (NVMe PCIe 4.0/5.0) y los auriculares con sonido espacial experimentan sus mínimos históricos anuales antes de la saturación de diciembre.</p>

<h3>C. Domótica y Sonido Inteligente</h3>
<p>Los ecosistemas de hogar conectado son la punta de lanza de los gigantes del e-commerce. Dispositivos como altavoces inteligentes, cámaras de seguridad Wi-Fi, bombillas LED programables y sistemas de malla mesh experimentan descuentos de hasta el 50%, sirviendo como puerta de entrada para los usuarios que buscan automatizar su vivienda.</p>

<h3>D. Wearables y Cuidado Personal</h3>
<p>Relojes inteligentes, pulseras de actividad y auriculares totalmente inalámbricos (TWS) con cancelación activa de ruido (ANC) constituyen otra de las áreas con mayor densidad de chollos. La fuerte competencia entre marcas facilita la localización de modelos con gran autonomía y sensores de salud avanzados por debajo de la barrera de los 50 o 100 euros.</p>

<hr />

<h2>3. Estrategias Avanzadas para Identificar Chollos Reales</h2>

<p>Un descuento anunciado del 40% no siempre implica un ahorro real si la tienda ha elevado previamente el Precio Recomendado de Venta (PVP). Para realizar compras inteligentes durante el Pre-Black Friday, conviene aplicar un enfoque analítico basado en las siguientes pautas:</p>

<h3>1. Comprobación de Histórico de Precios</h3>
<p>Antes de pulsar el botón de compra, es imprescindible revisar el histórico de cotización del producto durante los últimos 90 días. Herramientas y extensiones de navegador especializadas permiten verificar si el precio actual es un mínimo histórico o si ha estado más barato en semanas recientes.</p>

<h3>2. Análisis de Costes de Envío y Devoluciones</h3>
<p>Un chollo puede verse neutralizado por gastos de envío elevados o condiciones de devolución restrictivas. Verifica siempre que la tienda ofrezca período de devolución ampliado hasta enero (muy habitual en campañas navideñas) y coberturas claras en caso de tramitación de garantía.</p>

<h3>3. Suscripciones y Cupones Promocionales</h3>
<p>Muchas plataformas añaden un nivel extra de descuento mediante la combinación de ofertas directas con cupones aplicables en el carrito de compra o descuentos por primera compra desde la aplicación móvil. Estar atento a estos códigos acumulables marca la diferencia entre una compra correcta y un verdadero chollo.</p>

<hr />

<h2>4. CheckList: Cómo Preparar tus Compras de Otoño</h2>

<p>Para evitar imprevistos y asegurar las unidades de los productos más demandados antes de que se agote el stock, recomendamos seguir esta lista de verificación rápida:</p>

<ul>
  <li><strong>Crea una lista de deseos priorizada:</strong> Define de antemano qué productos necesitas realmente y establece un precio máximo dispuesto a pagar.</li>
  <li><strong>Registra tus datos de pago y envío:</strong> En eventos de gran afluencia, los chollos más agresivos duran minutos. Tener las cuentas configuradas agiliza el proceso de *checkout*.</li>
  <li><strong>Establece alertas de precio:</strong> Configura notificaciones para recibir avisos automáticos cuando un artículo baje de tu umbral objetivo.</li>
  <li><strong>Compara entre varios distribuidores:</strong> No te limites a un único portal; las guerras de precios entre grandes superficies suelen provocar que la competencia iguale las ofertas en cuestión de horas.</li>
  <li><strong>Verifica la garantía legal:</strong> Recuerda que en España la garantía legal cubre los productos nuevos durante 3 años, asegurando la reparación o sustitución ante defectos de fabricación.</li>
</ul>

<hr />

<h2>Conclusión: Comprar con Cabeza en la Era de los Algoritmos</h2>
<p>Los Días de Ofertas de Otoño y las campañas Pre-Black Friday de 2026 ofrecen oportunidades excepcionales para optimizar el presupuesto tecnológico. La clave para aprovechar esta época no reside en comprar más, sino en comprar mejor: identificando las necesidades reales, apoyándose en la verificación de datos y actuando con rapidez ante los mínimos históricos confirmados.</p>

<p>En <strong>Trendiverse</strong> seguiremos rastreando diariamente los principales catálogos y plataformas para seleccionar únicamente aquellas ofertas que cumplan con los estándares de calidad, garantía y ahorro real.</p>`

const mundial2026Content = `La Copa del Mundo de la FIFA 2026 ya está en el centro de atención de millones de aficionados. No es solo un torneo más dentro del calendario internacional: es una edición histórica, con un formato renovado, sedes repartidas en varios países y una expectativa global enorme. El Mundial 2026 será el primero en la historia en celebrarse en tres naciones anfitrionas: Estados Unidos, México y Canadá.`

const mundialGuiaContent = `La Copa mundial de la FIFA 2026 será un hito dentro de la historia del fútbol internacional. No solo por la magnitud del torneo, sino por el contexto detrás de él: se celebrará en tres países, en más ciudades de lo habitual, con una evolución del formato que convierte cada partido en un acontecimiento mayor.`

export const SAMPLE_ARTICLES: Article[] = [
  a(
    5,
    'Guía Definitiva de Chollos de Otoño y Campañas Pre-Black Friday 2026: Cómo Ahorrar al Máximo en Tecnología',
    'guia-chollos-otono-campanas-pre-black-friday-2026',
    'chollos',
    'Descubre las mejores estrategias para cazar chollos en los Días de Ofertas de Otoño y el Pre-Black Friday 2026. Analizamos ofertas en tecnología, gaming y pequeños electrodomésticos.',
    'chollos-otono',
    9,
    105000,
    1,
    chollosOtonoContent
  ),
  a(1, 'Copa del Mundo de la FIFA 2026: fechas, sedes, formato y todo lo que debes saber', 'copa-del-mundo-fifa-2026', 'virales', 'La edición más grande del torneo llega con sedes en tres países y un formato sin precedentes.', 'mundial2026', 8, 145000, 1, mundial2026Content),
  a(4, 'Copa mundial de la FIFA 2026: guía completa de grupos, sedes y expectativas del torneo', 'copa-mundial-fifa-2026-guia-completa', 'virales', 'Guía con el desarrollo del torneo, los cambios en los grupos y las principales sedes.', 'mundialguia', 7, 85000, 0, mundialGuiaContent),
]

export const SAMPLE_CODES = [
  {
    game: 'Genshin Impact',
    code: 'GENSHIN2026OCT',
    reward: '60 Protogemas + 5 Experiencia',
    expires: '2026-10-31',
  },
  {
    game: 'Honkai: Star Rail',
    code: 'STARRAILOCT26',
    reward: '50 Stellar Jade',
    expires: '2026-10-31',
  },
]

export const SAMPLE_DEALS: Deal[] = [
  {
    id: 1,
    title: 'PlayStation 5 Slim + Mando DualSense Extra',
    store: 'Amazon',
    price: 479.99,
    original_price: 549.99,
    discount_percentage: 13,
    url: '#',
    image_url: '/images/articles/chollos-otono.svg',
    category: 'Gaming',
    posted_at: iso(0.1),
  },
]

export const SAMPLE_TOOLS: Tool[] = [
  {
    id: 1,
    name: 'Calculadora de Descuentos',
    slug: 'calculadora-descuentos',
    description: 'Calcula el precio final con porcentaje de rebaja aplicado.',
    category: 'Finanzas',
  },
]
