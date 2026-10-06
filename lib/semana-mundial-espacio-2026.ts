import type { Article } from './types'

/**
 * Artículo sobre la Semana Mundial del Espacio 2026.
 * Categoría `tecnologia`. Formato editorial: Markdown simple (## / ### / listas /
 * **negrita**), tal como lo consume `parseArticleContent` en lib/article-content.ts.
 * Nota: el parser no soporta tablas, así que los temas por año van como lista.
 */
export const SEMANA_MUNDIAL_ESPACIO_2026_ARTICLES: Article[] = [
  {
    id: 9,
    title: 'Semana Mundial del Espacio 2026: fechas, lema «Revolución de los Cohetes» y actividades en España',
    slug: 'semana-mundial-del-espacio-2026',
    category: 'tecnologia',
    excerpt: 'Del 4 al 10 de octubre de 2026 se celebra la Semana Mundial del Espacio, declarada por la ONU y centrada este año en la Revolución de los Cohetes. Repasamos su origen, el lema de 2026, las actividades en España y qué se puede ver en el cielo estos días.',
    content: `Del 4 al 10 de octubre de 2026 se celebra la Semana Mundial del Espacio, el mayor evento espacial del planeta. Este año llega con un lema que habla de un cambio de época: la Revolución de los Cohetes. Te contamos qué es, por qué se celebra en estas fechas concretas y cómo puedes participar en España.

## Qué es la Semana Mundial del Espacio

La Semana Mundial del Espacio, conocida internacionalmente como World Space Week, es una celebración anual declarada por Naciones Unidas. La Asamblea General la estableció en su resolución 54/68, de 6 de diciembre de 1999, y su objetivo es celebrar cada año las aportaciones de la ciencia y la tecnología espaciales a la mejora de la vida de las personas.

Se celebra en más de 95 países y cada año el Consejo de Dirección de la Asociación de la Semana Mundial del Espacio elige un tema en coordinación con la Oficina de Asuntos del Espacio Ultraterrestre de la ONU. Ese tema común sirve para orientar todos los programas que se organizan en el mundo y multiplicar su impacto.

La magnitud del evento es difícil de exagerar: en 2025 se celebraron alrededor de 50.000 eventos organizados por agencias espaciales, colegios, empresas del sector y asociaciones. Es, con diferencia, la mayor celebración espacial que existe.

## Por qué se celebra del 4 al 10 de octubre

Las fechas no son casuales. Marcan dos hitos que cambiaron la historia de la humanidad y que coinciden con los dos extremos de la semana:

- El **4 de octubre de 1957**, la Unión Soviética lanzó el **Sputnik 1**, el primer satélite artificial de la historia. Fue el primer objeto fabricado por el ser humano que orbitó la Tierra y marcó el inicio de la era espacial.
- El **10 de octubre de 1967** entró en vigor el **Tratado del Espacio Ultraterrestre**, que estableció los principios que rigen la exploración y el uso pacífico del espacio.

Elegir esos dos días como principio y fin de la semana resume muy bien la idea: desde el primer objeto en órbita hasta el marco legal que ordena todo lo que vino después.

## El tema de 2026: la Revolución de los Cohetes

El lema de este año es «Revolución de los Cohetes», en inglés Rocket Revolution. Es un reconocimiento a cómo ha cambiado la forma de llegar al espacio en pocos años, y responde a tres factores concretos:

- **Los cohetes reutilizables.** Que un cohete pueda volver y volver a usarse trastocó por completo la economía del sector. Lo que antes era un gasto de un solo uso se ha convertido en un activo que se recupera.
- **La caída de los precios de lanzamiento.** Es la consecuencia directa del punto anterior. Poner un kilo en órbita hoy cuesta una fracción de lo que costaba hace apenas dos décadas.
- **La entrada de empresas privadas.** El sector dejó de ser territorio exclusivo de las agencias estatales y hoy conviven con ellas compañías que lanzan con regularidad comercial.

Dennis Stone, presidente de la Asociación de la Semana Mundial del Espacio, lo resumió así: el tema reconoce cómo el mayor acceso al espacio y la bajada de los precios de lanzamiento han estimulado el ecosistema espacial y las nuevas aplicaciones que están apareciendo. Y añadió una intención educativa explícita: el tema de la cohetería se usará también para despertar el interés de los estudiantes por las carreras STEM.

## Un tema distinto cada año

Cada edición tiene un lema propio, y mirar la serie completa ayuda a entender hacia dónde se mueve el sector:

- **2026:** Revolución de los Cohetes
- **2025:** Vivir en el espacio
- **2024:** Espacio y cambio climático
- **2023:** Espacio y emprendimiento
- **2022:** Espacio y sostenibilidad
- **2021:** Mujeres en el espacio
- **2020:** Los satélites mejoran la vida

La progresión es elocuente. Entre 2020 y 2022 los temas giraban en torno a la utilidad del espacio para la Tierra: satélites, sostenibilidad, clima. A partir de 2023 el foco se desplaza a quién hace las cosas y cómo: emprendimiento, vida en el espacio y, este año, la tecnología que hace posible llegar allí.

## Actividades en España

La Agencia Espacial Europea respalda la Semana Mundial del Espacio en España, donde se organizan actividades con la colaboración de ayuntamientos, museos de ciencia, universidades y empresas del sector. La mayoría son gratuitas y para todos los públicos.

Las ciudades que habitualmente concentran la programación incluyen Barcelona, Madrid, Valencia, Sevilla, Murcia, Pamplona, Logroño, Huesca y Valladolid. Los contenidos abarcan desde los fundamentos de la astronomía hasta el turismo espacial, pasando por la viabilidad de llevar personas a Marte.

En la edición de este año ya se han anunciado actividades como las de **Tres Cantos**, en Madrid, donde más de 600 escolares de sexto de Primaria han trabajado en clase en torno al lema de la Revolución de los Cohetes, con carteles y murales que se exponen en el Centro Cultural Adolfo Suárez. **Sevilla**, que es Capital Espacial Española, ha programado proyecciones y un ciclo de cine espacial en colaboración con la Fundación Cajasol.

Si quieres participar, la organización mantiene una página con el listado de eventos por país, y en España hay además una comunidad activa en redes que publica la agenda diaria.

## Qué se puede ver en el cielo esta semana

Una de las mejores cosas de la Semana Mundial del Espacio es que no hace falta asistir a ningún evento para disfrutarla. El cielo de estos días ofrece varios planes gratuitos, y coinciden casi todos con las fechas del evento:

- **4 de octubre:** Saturno en oposición. Es el mejor momento del año para observarlo, porque está en su punto más cercano a la Tierra y se ve toda la noche.
- **5 de octubre:** la Luna junto a Marte.
- **6 de octubre:** la Luna junto a Júpiter.
- **8 y 9 de octubre:** máximo de las Dracónidas, una lluvia de meteoros modesta pero curiosa, porque sus estrellas fugaces son lentas y dejan estelas largas.
- **10 de octubre:** Luna nueva. Es la noche ideal para observar el cielo profundo, porque no hay luz lunar que moleste.

Si tienes prismáticos, apúntalos a Saturno los días 4 y 5: sus anillos son visibles incluso con un equipo modesto. Y no hace falta telescopio para reconocer a simple vista los planetas más brillantes.

## Por qué importa la Semana Mundial del Espacio

Más allá de los eventos y las actividades escolares, la Semana Mundial del Espacio cumple una función que va mucho más allá de la divulgación. El espacio sostiene buena parte de la vida cotidiana de forma invisible: los satélites dan servicio a la navegación del móvil, a las previsiones meteorológicas, a las comunicaciones y al seguimiento de catástrofes naturales.

La propia declaración de la ONU lo dejó claro en 1999: la semana existe para celebrar la contribución de la ciencia y la tecnología espaciales a la mejora de la condición humana. No se trata solo de admirar cohetes, sino de entender que la infraestructura que hay sobre nuestras cabezas sostiene cosas tan terrenales como saber si va a llover mañana o encontrar una dirección en el móvil.

Y el lema de este año añade una capa más. Si la Revolución de los Cohetes ha bajado el coste de acceso, las consecuencias van mucho más allá de las empresas que lanzan. Un acceso más barato significa más satélites de observación para vigilar el clima, más posibilidades para la investigación científica y más países capaces de tener su propio programa espacial.

## Preguntas frecuentes

### ¿Cuándo es la Semana Mundial del Espacio 2026?

Del 4 al 10 de octubre de 2026. Las fechas son fijas todos los años y coinciden con el aniversario del lanzamiento del Sputnik 1 y con la entrada en vigor del Tratado del Espacio Ultraterrestre.

### ¿Cuál es el tema de este año?

«Revolución de los Cohetes». Aborda cómo los cohetes reutilizables, la caída de los precios de lanzamiento y la irrupción de empresas privadas están cambiando el acceso al espacio.

### ¿Quién organiza la Semana Mundial del Espacio?

Fue declarada por Naciones Unidas en 1999, y la Asociación de la Semana Mundial del Espacio es quien coordina cada edición y elige el tema anual junto con la Oficina de Asuntos del Espacio Ultraterrestre de la ONU.

### ¿Las actividades son gratuitas?

La mayoría sí. En España la programación se articula con ayuntamientos, museos de ciencia y universidades, y una gran parte de las actividades son gratuitas y abiertas a todos los públicos.

### ¿Qué se puede ver en el cielo durante la semana?

Coinciden varios eventos: Saturno en oposición el 4 de octubre, la Luna junto a Marte el 5, la Luna junto a Júpiter el 6, el máximo de las Dracónidas entre el 8 y el 9, y Luna nueva el 10.`,
    image_url: '/images/articles/semana-mundial-espacio-2026.svg',
    thumbnail_url: '/images/articles/semana-mundial-espacio-2026.svg',
    read_time_minutes: 9,
    views: 0,
    trending: 1,
    published_at: '2026-10-06T18:00:00.000Z',
  },
]
