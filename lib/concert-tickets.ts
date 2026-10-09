/**
 * Página donde se venden las entradas de cada cita.
 * No es la fuente editorial: esa sigue en sourceUrl.
 * "abierta" solo cuando la página del vendedor muestra la compra de esa cita.
 * "agotadas" y "cerrada" enlazan igual, sin prometer localidad.
 * "enlace" es la página oficial de la cita cuando no cabe decir que toda la taquilla está abierta.
 */

import type { Concert } from './concerts'

export type TicketState = 'abierta' | 'agotadas' | 'cerrada' | 'enlace'

export interface ConcertTickets {
  name: string
  url: string
  state: TicketState
  note?: string
}

export const CONCERT_TICKETS: Record<string, ConcertTickets> = {
  'jazzmadrid-2026': {
    name: 'JAZZMADRID',
    url: 'https://festivaldejazzmadrid.com/entradas/',
    state: 'abierta',
  },
  'shakira-madrid-2026': {
    name: 'Live Nation',
    url: 'https://www.livenation.es/event/shakira-las-mujeres-ya-no-lloran-residencia-europea-madrid-tickets-edp1662756',
    state: 'abierta',
    note: 'Se compran en Live Nation. Esa página reúne las noches del 9 al 12 de octubre, incluida la despedida.',
  },
  'myke-towers-zaragoza-2026': {
    name: 'Espacio Zity',
    url: 'https://www.espaciozity.es/entradas/myke-towers',
    state: 'abierta',
  },
  'omar-courtz-zaragoza-2026': {
    name: 'Espacio Zity',
    url: 'https://www.espaciozity.es/entradas/omar-courtz',
    state: 'agotadas',
    note: 'La página oficial es la de Espacio Zity. La prensa local dio por agotadas las entradas el 28 de septiembre de 2026.',
  },
  'simple-plan-madrid-2026': {
    name: 'Palacio Vistalegre',
    url: 'https://www.palaciovistalegre.com/event/simple-plan-bigger-than-you-think-europe-tour-2026/',
    state: 'abierta',
  },
  'morat-madrid-2026': {
    name: 'Movistar Arena',
    url: 'https://www.movistararena.es/programacion/evento/morat-yem-world-tour',
    state: 'abierta',
    note: 'Se compran en el Movistar Arena. La página reúne las cuatro noches.',
  },
  'pitbull-barcelona-2026': {
    name: 'Live Nation',
    url: 'https://www.livenation.es/event/pitbull-i-m-back--barcelona-tickets-edp1657548',
    state: 'abierta',
  },
  'pitbull-madrid-2026': {
    name: 'Live Nation',
    url: 'https://www.livenation.es/event/pitbull-i-m-back--madrid-tickets-edp1657555',
    state: 'abierta',
  },
  'vetusta-morla-madrid-2026': {
    name: 'Movistar Arena',
    url: 'https://www.movistararena.es/programacion/evento/vetusta-morla-gira-de-vuelta-canciones-de-ida',
    state: 'enlace',
    note: 'El Movistar Arena marca agotadas las noches del 20 y del 21 de noviembre. La página reúne también la del 19.',
  },
  'tokio-hotel-madrid-2026': {
    name: 'Palacio Vistalegre',
    url: 'https://www.palaciovistalegre.com/event/tokio-hotel/',
    state: 'abierta',
  },
  'victor-manuel-madrid-2026': {
    name: 'Movistar Arena',
    url: 'https://www.movistararena.es/programacion/evento/v-ctor-manuel-solo-a-solas-conmigo/29-11-2026/19:00',
    state: 'abierta',
  },
  'bunbury-madrid-2026': {
    name: 'Movistar Arena',
    url: 'https://www.movistararena.es/programacion/evento/bunbury-nuevas-mutaciones-tour-2026/4-12-2026/20:30',
    state: 'abierta',
  },
  'hombres-g-madrid-2026': {
    name: 'Movistar Arena',
    url: 'https://www.movistararena.es/programacion/evento/hombres-g-gira-2026-los-mejores-anos-de-nuestra-vida',
    state: 'agotadas',
    note: 'El Movistar Arena marca las dos noches como agotadas.',
  },
  'raphael-madrid-2026': {
    name: 'Movistar Arena',
    url: 'https://www.movistararena.es/programacion/evento/raphael-raphaelisimo-tour-2026/19-12-2026/20:30',
    state: 'abierta',
  },
  'carolina-durante-bilbao-2026': {
    name: 'Fever',
    url: 'https://feverup.com/m/274925',
    state: 'abierta',
    note: 'Se compran en Fever, el canal que publica el Bizkaia Arena para esta noche.',
  },
  'amaral-madrid-2026': {
    name: 'Movistar Arena',
    url: 'https://www.movistararena.es/programacion/evento/amaral-dolce-vita-tour-fin-de-gira/28-12-2026/20:30',
    state: 'abierta',
  },
  'oreja-van-gogh-madrid-2026': {
    name: 'Movistar Arena',
    url: 'https://www.movistararena.es/programacion/evento/la-oreja-de-van-gogh-tantas-cosas-que-contar-tour-2026/30-12-2026/20:30',
    state: 'abierta',
  },
  'carolina-durante-madrid-2027': {
    name: 'Movistar Arena',
    url: 'https://www.movistararena.es/programacion/evento/carolina-durante-fin-de-la-aventura/8-1-2027/20:00',
    state: 'abierta',
  },
  'muse-madrid-2027': {
    name: 'Live Nation',
    url: 'https://www.livenation.es/event/muse-the-wow-signal-europa-tour-madrid-tickets-edp1701919',
    state: 'abierta',
    note: 'Se compran en Live Nation. Esa página reúne las dos noches de enero.',
  },
  'cano-valencia-2027': {
    name: 'Baila.fm',
    url: 'https://www.baila.fm/es/evento/cano-gira-anais-tour-2027',
    state: 'abierta',
  },
  'thirty-stm-madrid-2027': {
    name: 'Movistar Arena',
    url: 'https://www.movistararena.es/programacion/evento/thirty-seconds-to-mars-a-beautiful-lie-vs-this-is-war/8-4-2027/20:30',
    state: 'abierta',
  },
  'quevedo-madrid-2027': {
    name: 'Movistar Arena',
    url: 'https://www.movistararena.es/programacion/evento/quevedo-el-baifo-tour-2027',
    state: 'agotadas',
    note: 'El Movistar Arena marca las ocho noches como agotadas.',
  },
  'cano-bilbao-2027': {
    name: 'Baila.fm',
    url: 'https://www.baila.fm/es/evento/cano-anais-tour-2027',
    state: 'abierta',
  },
  'cano-barcelona-2027': {
    name: 'Baila.fm',
    url: 'https://www.baila.fm/es/evento/cano-anais-tour-2027-1',
    state: 'abierta',
  },
  'cano-aviles-2027': {
    name: 'Baila.fm',
    url: 'https://www.baila.fm/es/evento/cano-anais-tour-2027-2',
    state: 'abierta',
  },
  'cano-murcia-2027': {
    name: 'Baila.fm',
    url: 'https://www.baila.fm/es/evento/cano-anais-tour-2027-3',
    state: 'abierta',
  },
  'olivia-rodrigo-barcelona-2027': {
    name: 'Live Nation',
    url: 'https://www.livenation.es/event/olivia-rodrigo-the-unraveled-tour-barcelona-tickets-edp1670572',
    state: 'abierta',
    note: 'Se compran en Live Nation. Esa página reúne las noches del 1, 2, 5 y 6 de mayo.',
  },
  'cano-sevilla-2027': {
    name: 'Baila.fm',
    url: 'https://www.baila.fm/es/evento/cano-anais-tour-2027-4',
    state: 'abierta',
  },
  'cano-coruna-2027': {
    name: 'Concello de A Coruña',
    url: 'https://www.visitcoruna.com/turismo/es/detalle/cano-anais-tour-2027/suceso/1453918375238',
    state: 'enlace',
    note: 'El Concello de A Coruña publica en esta ficha la venta en línea, en Ataquilla, dentro del buscador del Coliseum.',
  },
  'primavera-sound-2027': {
    name: 'Primavera Sound',
    url: 'https://www.primaverasound.com/es/barcelona/tickets-barcelona',
    state: 'abierta',
  },
  'karol-g-barcelona-2027': {
    name: 'Live Nation',
    url: 'https://www.livenation.es/event/karol-g-viajando-por-el-mundo-tropitour-barcelona-tickets-edp1667666',
    state: 'abierta',
    note: 'Se compran en Live Nation. Esa página reúne las dos noches de Barcelona.',
  },
  'cano-malaga-2027': {
    name: 'Baila.fm',
    url: 'https://www.baila.fm/es/evento/cano-anais-tour-2027-6',
    state: 'abierta',
  },
  'karol-g-sevilla-2027': {
    name: 'Live Nation',
    url: 'https://www.livenation.es/event/karol-g-viajando-por-el-mundo-tropitour-sevilla-tickets-edp1667669',
    state: 'abierta',
    note: 'Se compran en Live Nation. Esa página reúne las tres noches de Sevilla.',
  },
  'cano-valladolid-2027': {
    name: 'Baila.fm',
    url: 'https://www.baila.fm/es/evento/cano-anais-tour-2027-7',
    state: 'abierta',
  },
  'sonar-2027': {
    name: 'Sónar',
    url: 'https://sonar.es/es/noticias/preventa-2027',
    state: 'cerrada',
    note: 'La preventa de 2027 ya cerró y la venta general no está abierta. Esta nota del festival es la página oficial de esas entradas. La tienda del sitio sigue siendo la edición de 2026.',
  },
  'karol-g-madrid-2027': {
    name: 'Live Nation',
    url: 'https://www.livenation.es/event/karol-g-viajando-por-el-mundo-tropitour-madrid-tickets-edp1667674',
    state: 'abierta',
    note: 'Se compran en Live Nation. Esa página reúne las noches de Madrid.',
  },
  'mad-cool-2027': {
    name: 'Mad Cool',
    url: 'https://www.madcoolfestival.es/tickets',
    state: 'cerrada',
    note: 'La página oficial dice que ahora mismo no hay entradas a la venta.',
  },
  'bbk-live-2027': {
    name: 'Bilbao BBK Live',
    url: 'https://bilbaobbklive.com/tickets/',
    state: 'cerrada',
    note: 'Bilbao BBK Live anuncia ahí el 8, 9 y 10 de julio de 2027, pero esa venta no está abierta. Los botones de compra de la página son del festival de 2026.',
  },
  'don-omar-barakaldo-2027': {
    name: 'Janto',
    url: 'https://sfxpreventa1.janto.es/espectaculo/don-omar-bilbao/DONOMARBIL2027',
    state: 'abierta',
    note: 'Se compran en Janto, el enlace de entradas que publica la web de Don Omar para Bilbao.',
  },
  'oasis-barcelona-2027': {
    name: 'Live Nation',
    url: 'https://www.livenation.es/event/oasis-live-27-barcelona-tickets-edp1697229',
    state: 'agotadas',
    note: 'Live Nation muestra las dos noches como no disponibles.',
  },
  'don-omar-valencia-2027': {
    name: 'Janto',
    url: 'https://sfxpreventa2.janto.es/espectaculo/don-omar-valencia/DONOMARVAL2027',
    state: 'abierta',
    note: 'Se compran en Janto, el enlace de entradas que publica la web de Don Omar para Valencia.',
  },
  'don-omar-murcia-2027': {
    name: 'Janto',
    url: 'https://sfxpreventa2.janto.es/espectaculo/don-omar-murcia/DONOMARMUR2027',
    state: 'abierta',
    note: 'Se compran en Janto, el enlace de entradas que publica la web de Don Omar para Murcia.',
  },
  'don-omar-madrid-2027': {
    name: 'Janto',
    url: 'https://sfxpreventa.janto.es/espectaculo/don-omar-madrid/DONOMARMAD2027',
    state: 'abierta',
    note: 'Se compran en Janto, el enlace de entradas que publica la web de Don Omar para Madrid.',
  },
  'don-omar-fuengirola-2027': {
    name: 'Janto',
    url: 'https://sfxpreventa3.janto.es/espectaculo/don-omar-fuengirola-(malaga)/DONOMARMLG2027',
    state: 'abierta',
    note: 'Se compran en Janto, el enlace de entradas que publica la web de Don Omar para Fuengirola.',
  },
  'cano-madrid-2027': {
    name: 'Baila.fm',
    url: 'https://www.baila.fm/es/evento/cano-anais-tour-2027-8',
    state: 'abierta',
  },
  'don-omar-coruna-2027': {
    name: 'Janto',
    url: 'https://sfxpreventa1.janto.es/espectaculo/don-omar-a-coruna/DONOMARACORU2027',
    state: 'abierta',
    note: 'Se compran en Janto, el enlace de entradas que publica la web de Don Omar para A Coruña.',
  },
  'don-omar-las-palmas-2027': {
    name: 'Janto',
    url: 'https://sfxpreventa3.janto.es/espectaculo/don-omar-gran-canaria/DONOMARGC2027',
    state: 'abierta',
    note: 'Se compran en Janto, el enlace de entradas que publica la web de Don Omar para Gran Canaria.',
  },
  'harry-styles-madrid-2027': {
    name: 'Live Nation',
    url: 'https://www.livenation.es/harry-styles-tickets-adp971975',
    state: 'abierta',
    note: 'Se compran en Live Nation. Esa página reúne el 30 y el 31 de julio y el 2 de agosto.',
  },
}

export function ticketsFor(concert: Pick<Concert, 'id'>): ConcertTickets {
  const tickets = CONCERT_TICKETS[concert.id]
  if (!tickets) throw new Error(`Falta la página de entradas de ${concert.id}`)
  return tickets
}

export function ticketLabel(concert: Pick<Concert, 'id'>): string {
  return ticketsFor(concert).state === 'abierta' ? 'Comprar entradas' : 'Página de entradas'
}

export function ticketNote(concert: Pick<Concert, 'id'>): string {
  const tickets = ticketsFor(concert)
  if (tickets.note) return tickets.note
  if (tickets.state === 'abierta') return `Se compran en ${tickets.name}.`
  if (tickets.state === 'agotadas') return `${tickets.name} las marca agotadas.`
  return `En ${tickets.name} esta cita no tiene la venta abierta.`
}
