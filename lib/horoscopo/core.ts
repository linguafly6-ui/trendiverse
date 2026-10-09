/**
 * Horóscopo semanal de TrendiVerse.
 * Cada semana tiene su propio archivo en lib/horoscopo/, con el cielo fechado y las doce
 * lecturas. Las casas se cuentan en signos enteros desde el signo solar, porque el ascendente
 * del lector no está en la página. La lectura es interpretación, no un pronóstico.
 *
 * Los textos de cada signo están escritos en lenguaje cotidiano: amor, trabajo, dinero,
 * bienestar y un consejo. La parte técnica (casas, retrógrados, efemérides) se muestra
 * aparte, para quien quiera consultarla.
 */

export const ASTRO_GUIDE_SLUG = 'como-leemos-el-horoscopo-astrologia-tropical'

export const DISCLAIMER =
  'El horóscopo es un contenido de entretenimiento y reflexión. No predice tu futuro ni sustituye el consejo de un médico, un abogado o un asesor financiero.'

export const METHOD_NOTE =
  'Esta lectura usa astrología tropical a partir de tu signo solar. Las casas se cuentan de signo en signo desde el tuyo. Si conoces tu ascendente, el mapa cambia y la lectura también.'

export const HOUSES: Record<number, string> = {
  1: 'la forma de empezar y de presentarte',
  2: 'el dinero propio, el valor y lo que consideras tuyo',
  3: 'los mensajes, los trámites y la gente cercana',
  4: 'la casa, la familia y la base desde la que trabajas',
  5: 'el juego, la creación y el romance',
  6: 'la rutina, el horario y el cuidado del día a día',
  7: 'la pareja, los socios y los acuerdos',
  8: 'lo que se comparte, las deudas y lo que no se dice',
  9: 'los estudios, los viajes y las ideas grandes',
  10: 'el oficio visible, la reputación y la responsabilidad',
  11: 'los grupos, los amigos y los planes colectivos',
  12: 'el descanso y lo que ocurre entre bastidores',
}

export const ORDER = [
  'aries',
  'tauro',
  'geminis',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'escorpio',
  'sagitario',
  'capricornio',
  'acuario',
  'piscis',
] as const

export type SignSlug = (typeof ORDER)[number]

export interface SignInfo {
  name: string
  symbol: string
  dates: string
  element: 'Fuego' | 'Tierra' | 'Aire' | 'Agua'
  modality: 'Cardinal' | 'Fijo' | 'Mutable'
  ruler: string
}

/** Lo que cambia cada semana para un signo. */
export interface WeekReading {
  slug: SignSlug
  /** Frase corta para la tarjeta del signo en la portada. */
  hook: string
  /** Título de la lectura principal, en una frase. */
  titulo: string
  /** Lectura general de la semana. */
  general: string
  /** Amor y relaciones. */
  relaciones: string
  /** Trabajo y estudios. */
  trabajo: string
  /** Dinero. */
  dinero: string
  /** Bienestar y tiempo para ti. */
  ritmo: string
  /** Consejo de la semana, en una o dos frases. */
  consejo: string
}

export type SignReading = WeekReading & SignInfo

export const SIGN_INFO: Record<SignSlug, SignInfo> = {
  aries: { name: 'Aries', symbol: '♈', dates: '21 de marzo – 19 de abril', element: 'Fuego', modality: 'Cardinal', ruler: 'Marte' },
  tauro: { name: 'Tauro', symbol: '♉', dates: '20 de abril – 20 de mayo', element: 'Tierra', modality: 'Fijo', ruler: 'Venus' },
  geminis: { name: 'Géminis', symbol: '♊', dates: '21 de mayo – 20 de junio', element: 'Aire', modality: 'Mutable', ruler: 'Mercurio' },
  cancer: { name: 'Cáncer', symbol: '♋', dates: '21 de junio – 22 de julio', element: 'Agua', modality: 'Cardinal', ruler: 'Luna' },
  leo: { name: 'Leo', symbol: '♌', dates: '23 de julio – 22 de agosto', element: 'Fuego', modality: 'Fijo', ruler: 'Sol' },
  virgo: { name: 'Virgo', symbol: '♍', dates: '23 de agosto – 22 de septiembre', element: 'Tierra', modality: 'Mutable', ruler: 'Mercurio' },
  libra: { name: 'Libra', symbol: '♎', dates: '23 de septiembre – 22 de octubre', element: 'Aire', modality: 'Cardinal', ruler: 'Venus' },
  escorpio: { name: 'Escorpio', symbol: '♏', dates: '23 de octubre – 21 de noviembre', element: 'Agua', modality: 'Fijo', ruler: 'Marte, y Plutón en la tradición moderna' },
  sagitario: { name: 'Sagitario', symbol: '♐', dates: '22 de noviembre – 21 de diciembre', element: 'Fuego', modality: 'Mutable', ruler: 'Júpiter' },
  capricornio: { name: 'Capricornio', symbol: '♑', dates: '22 de diciembre – 19 de enero', element: 'Tierra', modality: 'Cardinal', ruler: 'Saturno' },
  acuario: { name: 'Acuario', symbol: '♒', dates: '20 de enero – 18 de febrero', element: 'Aire', modality: 'Fijo', ruler: 'Saturno, y Urano en la tradición moderna' },
  piscis: { name: 'Piscis', symbol: '♓', dates: '19 de febrero – 20 de marzo', element: 'Agua', modality: 'Mutable', ruler: 'Júpiter, y Neptuno en la tradición moderna' },
}

export function withSignInfo(reading: WeekReading): SignReading {
  return { ...SIGN_INFO[reading.slug], ...reading }
}

export interface WeekTransit {
  /** «La luna nueva del sábado cae en Libra». Se completa con la casa de cada signo. */
  label: string
  sign: SignSlug
}

export interface HoroscopeWeek {
  /** Fecha de inicio, también identificador: '2026-10-15'. */
  id: string
  /** Segmento de URL: 'semana-15-21-octubre-2026'. */
  slug: string
  start: string
  end: string
  /** «15 al 21 de octubre de 2026». */
  label: string
  /** «15 al 21 de octubre». */
  shortLabel: string
  /** Los siete días con su nombre, para quien busca el horóscopo de un día concreto. */
  days: string
  sky: { items: string[]; sourceName: string; sourceUrl: string }
  transits: WeekTransit[]
  signs: SignReading[]
}

export function solarHouse(from: SignSlug, transit: SignSlug): number {
  const a = ORDER.indexOf(from)
  const b = ORDER.indexOf(transit)
  return ((b - a + 12) % 12) + 1
}

