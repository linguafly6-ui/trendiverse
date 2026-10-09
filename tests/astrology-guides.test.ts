import test from 'node:test'
import assert from 'node:assert/strict'
import { ASTROLOGY_GUIDES, ASTROLOGY_LIBRARY_SEO, ASTROLOGY_REFERENCES, astrologyGuideBody, astrologyGuideBySlug, astrologyGuidePath, astrologyGuideSources } from '../lib/astrology-guides'
import { weekBySlug, weekFirstDay, weekLastDay } from '../lib/astrology'
import { astrologyGuideGraph, astrologyLibraryGraph, astrologySectionGraph } from '../lib/structured-data'

test('astrology library has six distinct substantial guides with accurate SEO', () => {
  assert.equal(ASTROLOGY_GUIDES.length, 6)
  assert.equal(new Set(ASTROLOGY_GUIDES.map((guide) => guide.slug)).size, 6)
  assert.ok(ASTROLOGY_LIBRARY_SEO.title.length <= 46)
  assert.ok(ASTROLOGY_LIBRARY_SEO.description.length <= 155)
  for (const guide of ASTROLOGY_GUIDES) {
    assert.equal(astrologyGuideBySlug(guide.slug), guide)
    assert.equal(astrologyGuidePath(guide.slug), `/astrologia/guias/${guide.slug}`)
    assert.ok(guide.seoTitle.length <= 46, `${guide.slug} SEO title: ${guide.seoTitle.length}`)
    assert.ok(guide.description.length <= 155, `${guide.slug} description: ${guide.description.length}`)
    assert.ok(astrologyGuideBody(guide).split(/\s+/).length >= 600, `${guide.slug} needs depth`)
    assert.equal(new Set(guide.sections.map((section) => section.id)).size, guide.sections.length)
    assert.ok(guide.faqs.length >= 4)
    assert.ok(astrologyGuideSources(guide).length >= 2)
    assert.ok(astrologyGuideSources(guide).some((ref) => ref.url === ASTROLOGY_REFERENCES.science.url))
    for (const related of guide.related) {
      assert.ok(astrologyGuideBySlug(related), `${guide.slug} broken related link`)
      assert.notEqual(related, guide.slug)
    }
  }
  assert.equal(astrologyGuideBySlug('inexistente'), undefined)
})

test('birth-data guides preserve uncertainty and do not pretend to calculate a chart', () => {
  const asc = astrologyGuideBody(astrologyGuideBySlug('ascendente')!)
  const moon = astrologyGuideBody(astrologyGuideBySlug('signo-lunar')!)
  assert.match(asc, /hora.*lugar|lugar.*hora/i)
  assert.match(asc, /hora.*desconocid/i)
  assert.match(asc, /no calcula tu ascendente/i)
  assert.match(asc, /latitud/i)
  assert.match(moon, /dos opciones|dos posibilidades|ambos signos/i)
  assert.match(moon, /fase.*iluminación/i)
})

test('eclipse guide includes instrument-specific safety and separates prediction from observation', () => {
  const body = astrologyGuideBody(astrologyGuideBySlug('eclipses')!)
  assert.match(body, /ISO 12312-2/)
  assert.match(body, /instrumentos requieren filtros solares/)
  assert.match(body, /parciales y anulares/)
  assert.match(body, /no una afirmación de que el eclipse provoque/)
  assert.match(body, /guía permanente, no una agenda/)
})

test('guide schemas match visible content, contain citations and do not pose as weekly forecasts', () => {
  for (const guide of ASTROLOGY_GUIDES) {
    const schema = astrologyGuideGraph(guide)
    const article = schema['@graph'][0] as Record<string, unknown>
    const faq = schema['@graph'][1] as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] }
    assert.equal(article['@type'], 'Article')
    assert.equal(article.genre, 'Guía de astrología')
    assert.equal(article.articleBody, astrologyGuideBody(guide))
    assert.equal(article.mainEntityOfPage, `https://trendiverse.org${astrologyGuidePath(guide.slug)}`)
    assert.ok(Array.isArray(article.citation) && article.citation.length >= 2)
    assert.ok(!('temporalCoverage' in article))
    assert.deepEqual(faq.mainEntity.map((q) => q.name), guide.faqs.map((q) => q.q))
  }
})

test('library and main section expose guide URLs; dated weeks remain weekly collections', () => {
  const library = astrologyLibraryGraph()['@graph'][0] as { mainEntity: { numberOfItems: number } }
  assert.equal(library.mainEntity.numberOfItems, 6)
  const week = weekBySlug('semana-8-14-octubre-2026')!
  const root = astrologySectionGraph(week)['@graph'][1] as { mainEntity: { numberOfItems: number } }
  const dated = astrologySectionGraph(week, true)['@graph'][1] as { mainEntity: { numberOfItems: number } }
  assert.equal(root.mainEntity.numberOfItems, 18)
  assert.equal(dated.mainEntity.numberOfItems, 12)
})

test('visible week endpoints do not include the penultimate day', () => {
  const first = weekBySlug('semana-8-14-octubre-2026')!
  const second = weekBySlug('semana-15-21-octubre-2026')!
  assert.equal(weekFirstDay(first), 'jueves 8')
  assert.equal(weekLastDay(first), 'miércoles 14 de octubre de 2026')
  assert.equal(weekLastDay(second), 'miércoles 21 de octubre de 2026')
})
