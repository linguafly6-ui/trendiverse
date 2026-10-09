import {
  SECOND_HAND_PRODUCT_MAPPINGS,
  canComparePrices,
  type SecondHandProductMapping,
} from './second-hand-product-mapping'

/**
 * Candidatos editoriales para revisión humana.
 * No son un mapping verificado, no llevan identificador de marketplace
 * y no autorizan a comparar precios. El proveedor de datos no se toca.
 */

export const SECOND_HAND_TECH_SLUGS = [
  'iphone',
  'macbook',
  'ipad',
  'apple-watch',
  'samsung-galaxy',
  'playstation-5',
  'nintendo-switch',
  'xbox',
  'steam-deck',
] as const

export type SecondHandTechSlug = (typeof SECOND_HAND_TECH_SLUGS)[number]

export interface SecondHandTechCandidate {
  productId: SecondHandTechSlug
  /** Nombre tal como aparece en la ficha del fabricante. */
  name: string
  generation: string
  /** Capacidad o configuración que la misma ficha deja por escrito. */
  configuration: string
  sourceUrl: string
  reviewStatus: 'pending'
  externalProductId: null
}

export interface SecondHandTechCandidateGap {
  productId: SecondHandTechSlug
  missing: string
}

const OFFICIAL_HOSTS = new Set([
  'support.apple.com',
  'www.apple.com',
  'www.samsung.com',
  'www.playstation.com',
  'www.nintendo.com',
  'www.xbox.com',
  'www.steamdeck.com',
])

function candidate(
  productId: SecondHandTechSlug,
  name: string,
  generation: string,
  configuration: string,
  sourceUrl: string,
): SecondHandTechCandidate {
  return {
    productId,
    name,
    generation,
    configuration,
    sourceUrl,
    reviewStatus: 'pending',
    externalProductId: null,
  }
}

export const SECOND_HAND_TECH_CANDIDATES: readonly SecondHandTechCandidate[] = [
  candidate('iphone', 'iPhone 17', 'iPhone 17, 2025', '256 GB. La ficha también lista 512 GB.', 'https://support.apple.com/en-us/125089'),
  candidate('iphone', 'iPhone 17 Pro', 'iPhone 17 Pro, 2025', '256 GB. La ficha también lista 512 GB y 1 TB.', 'https://support.apple.com/en-us/125090'),
  candidate('iphone', 'iPhone 17 Pro Max', 'iPhone 17 Pro Max, 2025', '256 GB. La ficha también lista 512 GB, 1 TB y 2 TB.', 'https://support.apple.com/en-us/125091'),

  candidate('macbook', 'MacBook Pro (14-inch, M5)', 'M5, 2025', '16 GB de memoria unificada y SSD de 512 GB. La ficha lista de serie 16 GB, 24 GB o 32 GB, y SSD de 512 GB o 1 TB, configurable a 2 TB o 4 TB.', 'https://support.apple.com/en-us/125405'),
  candidate('macbook', 'MacBook Pro (14-inch, M5 Pro or M5 Max)', 'M5 Pro, 2026', 'Chip M5 Pro, 24 GB de memoria unificada y SSD de 1 TB. La ficha también lista SSD de 2 TB y configura 4 TB. El M5 Max de la misma página es otra configuración.', 'https://support.apple.com/en-us/126318'),
  candidate('macbook', 'MacBook Pro (16-inch, M5 Pro or M5 Max)', 'M5 Pro, 2026', 'Chip M5 Pro, 24 GB de memoria unificada y SSD de 1 TB. La ficha configura el SSD a 2 TB o 4 TB. El M5 Max de la misma página es otra configuración.', 'https://support.apple.com/en-us/126319'),

  candidate('ipad', 'iPad Pro 11-inch (M5)', 'M5, 2025', '256 GB. La ficha también lista 512 GB, 1 TB y 2 TB. No elige Wi-Fi o Cellular.', 'https://support.apple.com/en-us/125406'),
  candidate('ipad', 'iPad Pro 13-inch (M5)', 'M5, 2025', '256 GB. La ficha también lista 512 GB, 1 TB y 2 TB. No elige Wi-Fi o Cellular.', 'https://support.apple.com/en-us/125407'),

  candidate('apple-watch', 'Apple Watch Series 12', 'Series 12', 'Caja de aluminio o titanio de 42 mm y 64 GB. La ficha también lista cerámica de 43 mm. No separa una capacidad distinta para GPS y Cellular.', 'https://www.apple.com/apple-watch-series-12/specs/'),
  candidate('apple-watch', 'Apple Watch Series 12', 'Series 12', 'Caja de aluminio o titanio de 46 mm y 64 GB. La ficha también lista cerámica de 47 mm. No separa una capacidad distinta para GPS y Cellular.', 'https://www.apple.com/apple-watch-series-12/specs/'),
  candidate('apple-watch', 'Apple Watch Ultra 4', 'Ultra 4', 'Caja de titanio de 49 mm y 64 GB.', 'https://www.apple.com/apple-watch-ultra-4/specs/'),

  candidate('samsung-galaxy', 'Galaxy S25', 'S25', '256 GB y pantalla de 6,2 pulgadas. La ficha de EE. UU. también lista 128 GB.', 'https://www.samsung.com/us/smartphones/galaxy-s25/'),
  candidate('samsung-galaxy', 'Galaxy S25+', 'S25+', '256 GB y pantalla de 6,7 pulgadas. La ficha de EE. UU. también lista 512 GB.', 'https://www.samsung.com/us/smartphones/galaxy-s25/'),
  candidate('samsung-galaxy', 'Galaxy S25 Ultra', 'S25 Ultra', '256 GB. La ficha también nombra variantes de 512 GB y 1 TB.', 'https://www.samsung.com/ca/smartphones/galaxy-s25/specs/'),

  candidate('playstation-5', 'PS5 console - 1TB', 'PlayStation 5', 'Reproduce juegos de PS5 y PS4 en discos Blu-ray. La capacidad figura en el título de la ficha.', 'https://www.playstation.com/en-us/ps5/'),
  candidate('playstation-5', 'PS5 Digital Edition - 825GB', 'PlayStation 5', 'Versión all-digital, sin lector de discos. La capacidad figura en el título de la ficha.', 'https://www.playstation.com/en-us/ps5/'),

  candidate('nintendo-switch', 'Nintendo Switch - OLED Model', 'OLED', '64 GB de almacenamiento interno.', 'https://www.nintendo.com/us/gaming-systems/switch/tech-specs/'),
  candidate('nintendo-switch', 'Nintendo Switch console (HAC-001(-01))', 'consola con pantalla LCD de 6,2 pulgadas', '32 GB de almacenamiento interno.', 'https://www.nintendo.com/us/gaming-systems/switch/tech-specs/'),
  candidate('nintendo-switch', 'Nintendo Switch Lite (HDH-001)', 'Lite', '32 GB de almacenamiento interno.', 'https://www.nintendo.com/us/gaming-systems/switch/tech-specs/'),

  candidate('xbox', 'XBOX Series X Carbon Black', 'Series X', 'SSD NVMe personalizado de 1 TB y lector 4K UHD Blu-ray.', 'https://www.xbox.com/en-US/consoles/xbox-series-x'),
  candidate('xbox', 'XBOX Series X – 1TB Digital Edition', 'Series X', 'SSD NVMe personalizado de 1 TB. El selector de la misma página lo lista como 1 TB, All-Digital, Robot White. La sección de lector óptico no le asigna 4K UHD Blu-ray.', 'https://www.xbox.com/en-US/consoles/xbox-series-x'),
  candidate('xbox', 'XBOX Series S Robot White', 'Series S', 'SSD NVMe personalizado de 512 GB, solo digital. La ficha también lista variantes de 1 TB, también solo digitales.', 'https://www.xbox.com/en-us/consoles/xbox-series-s'),

  candidate('steam-deck', 'Steam Deck 512GB NVMe SSD', 'OLED', 'SSD NVMe de 512 GB, en la sección Steam Deck OLED.', 'https://www.steamdeck.com/en/tech'),
  candidate('steam-deck', 'Steam Deck 1TB NVMe SSD', 'OLED', 'SSD NVMe de 1 TB, en la sección Steam Deck OLED.', 'https://www.steamdeck.com/en/tech'),
]

export const SECOND_HAND_TECH_CANDIDATE_GAPS: readonly SecondHandTechCandidateGap[] = [
  { productId: 'iphone', missing: 'No se incluye iPhone 17e: esta revisión no abrió una ficha de especificaciones con su capacidad.' },
  { productId: 'macbook', missing: 'No se incluye MacBook Air. La ficha de apple.com/macbook-air/specs/ lista chip M5 en 13 y 15 pulgadas y varias combinaciones de memoria y SSD, entre ellas 16 GB con 512 GB. No se ha fijado una sola diagonal dentro del máximo de tres, ya ocupado por MacBook Pro.' },
  { productId: 'ipad', missing: 'No se incluyen iPad, iPad Air ni iPad mini. Solo se confirmaron capacidades del iPad Pro (M5). Wi-Fi o Cellular sigue sin elegir.' },
  { productId: 'apple-watch', missing: 'Apple Watch SE 3 no entra en el máximo de tres. Su ficha confirma caja de aluminio de 40 mm y de 44 mm, chip S10 y 64 GB, sin una capacidad distinta para GPS y Cellular. Los tres candidatos son Series 12 de 42 mm, Series 12 de 46 mm y Ultra 4. En Series 12 tampoco se elige GPS o Cellular, y la cerámica de 43 mm y 47 mm queda anotada en la configuración, no como candidato propio.' },
  { productId: 'samsung-galaxy', missing: 'No se incluyen Galaxy Z ni generaciones anteriores. No hay dato de ventas ni de precio en esta lista.' },
  { productId: 'playstation-5', missing: 'No hay un tercer candidato. La página de EE. UU. nombra PS5 console - 1TB, con discos Blu-ray, y PS5 Digital Edition - 825GB, sin lector. Una respuesta de esa página dice que la PS5 slim tiene un SSD de 1 TB, pero no fija un código de modelo en el título de estos dos candidatos, así que no se añade otro.' },
  { productId: 'nintendo-switch', missing: 'No se confirmó una sucesora en la ficha oficial consultada. Los candidatos son los tres modelos de esa página.' },
  { productId: 'xbox', missing: 'No se incluyen la X25 Limited Edition ni la Galaxy Black de 2 TB, que la ficha presenta como ediciones especiales. La lista se queda en Carbon Black de 1 TB con lector, la Digital Edition de 1 TB y la Series S Robot White de 512 GB.' },
  { productId: 'steam-deck', missing: 'La ficha técnica consultada no publica la capacidad de Steam Deck LCD. Solo entran las OLED de 512 GB y 1 TB.' },
]

export function techCandidatesFor(productId: string): readonly SecondHandTechCandidate[] {
  return SECOND_HAND_TECH_CANDIDATES.filter((item) => item.productId === productId)
}

export function isOfficialCandidateSource(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && OFFICIAL_HOSTS.has(parsed.hostname)
  } catch {
    return false
  }
}

/** Los candidatos no reescriben el catálogo ni lo dejan listo para comparar. */
export function techCandidatesLeaveMappingsPending(
  mappings: readonly SecondHandProductMapping[] = SECOND_HAND_PRODUCT_MAPPINGS,
): boolean {
  return SECOND_HAND_TECH_SLUGS.every((slug) => {
    const spec = mappings.find((item) => item.productId === slug)
    const proposed = techCandidatesFor(slug)
    if (!spec || proposed.length === 0 || proposed.length > 3) return false
    return spec.reviewStatus === 'pending'
      && spec.externalProductId === null
      && spec.verificationRef === null
      && canComparePrices(spec) === false
      && proposed.every((item) => item.reviewStatus === 'pending' && item.externalProductId === null)
  })
}
