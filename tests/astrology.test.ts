import test from 'node:test'
import assert from 'node:assert/strict'
import {
  currentWeek,
  DISCLAIMER,
  HOUSES,
  nextWeek,
  previousWeek,
  signSeoDescription,
  signSeoTitle,
  signTransitNotes,
  solarHouse,
  weekBySlug,
  WEEKS,
  weekSeo,
} from '../lib/astrology'
import { ASTROLOGIA_GUIA_2026, ASTROLOGIA_GUIA_SEO } from '../lib/astrologia-guia-2026'

test('weeks are dated, ordered and selectable by date', () => {
  assert.ok(WEEKS.length >= 2)
  assert.deepEqual(WEEKS.map((week) => week.start), [...WEEKS.map((week) => week.start)].sort())
  assert.equal(new Set(WEEKS.map((week) => week.slug)).size, WEEKS.length)
  const first = weekBySlug('semana-8-14-octubre-2026')!
  const second = weekBySlug('semana-15-21-octubre-2026')!
  assert.match(first.label, /8 al 14 de octubre de 2026/)
  assert.match(first.sky.items[0], /15:50 UTC/)
  assert.match(second.label, /15 al 21 de octubre de 2026/)
  assert.match(second.sky.items.join(' '), /16:12 UTC/)
  assert.match(second.sky.items.join(' '), /Plutón retoma el movimiento directo en Acuario el viernes 16/)
  assert.match(second.days, /jueves 15, viernes 16, sábado 17, domingo 18, lunes 19, martes 20 y miércoles 21 de octubre de 2026/)
  assert.equal(nextWeek(first), second)
  assert.equal(previousWeek(second), first)
  assert.equal(nextWeek(second), undefined)
  // La semana en curso cambia sola según la fecha de Madrid.
  assert.equal(currentWeek(new Date('2026-10-09T12:00:00Z')), first)
  assert.equal(currentWeek(new Date('2026-10-14T23:30:00Z')), second) // ya es 15 de octubre en Madrid
  assert.equal(currentWeek(new Date('2026-10-20T12:00:00Z')), second)
  assert.equal(currentWeek(new Date('2026-09-01T12:00:00Z')), first)
  assert.match(DISCLAIMER, /entretenimiento/i)
  assert.doesNotMatch(DISCLAIMER, /ascendente|casas/i)
  assert.equal(solarHouse('aries', 'libra'), 7)
  assert.equal(solarHouse('libra', 'libra'), 1)
  assert.equal(solarHouse('escorpio', 'libra'), 12)
  assert.equal(solarHouse('capricornio', 'aries'), 4)
  assert.equal(solarHouse('piscis', 'leo'), 6)
  assert.equal(solarHouse('acuario', 'acuario'), 1)
  assert.equal(solarHouse('cancer', 'capricornio'), 7)
})

test('every week has twelve plain-language readings optimised for «horóscopo + signo + fecha»', () => {
  for (const week of WEEKS) {
    assert.equal(week.signs.length, 12)
    assert.equal(new Set(week.signs.map((s) => s.slug)).size, 12)
    assert.ok(week.transits.length >= 4)
    const seo = weekSeo(week)
    assert.ok(seo.title.length <= 46, `${week.slug} title ${seo.title.length}`)
    assert.ok(seo.description.length <= 155, `${week.slug} description ${seo.description.length}`)
    for (const sign of week.signs) {
      const title = signSeoTitle(week, sign)
      const description = signSeoDescription(week, sign)
      assert.ok(title.startsWith(`Horóscopo ${sign.name} `), title)
      assert.ok(title.includes(week.shortLabel) && title.includes(week.start.slice(0, 4)), title)
      assert.ok(title.length <= 46, `${week.slug} ${sign.slug} title ${title.length}`)
      assert.ok(description.includes(week.label), description)
      assert.ok(description.length <= 155, `${week.slug} ${sign.slug} description ${description.length}`)
      const notes = signTransitNotes(week, sign)
      assert.equal(notes.length, week.transits.length)
      for (const transit of week.transits) {
        const house = solarHouse(sign.slug, transit.sign)
        assert.ok(HOUSES[house])
        assert.ok(notes.some((note) => note.includes(`casa ${house}: ${HOUSES[house]}`)))
      }
      assert.ok(sign.name && sign.symbol && sign.dates && sign.ruler, `${sign.slug} info`)
      assert.ok(sign.titulo.length > 0 && sign.titulo.length <= 60, `${week.slug} ${sign.slug} titulo`)
      assert.ok(sign.hook.length <= 70, `${week.slug} ${sign.slug} hook ${sign.hook.length}`)
      assert.ok(sign.consejo.length >= 30, `${week.slug} ${sign.slug} consejo`)
      const blob = `${sign.general} ${sign.relaciones} ${sign.trabajo} ${sign.dinero} ${sign.ritmo}`
      assert.ok(blob.split(/\s+/).length >= 250, `${week.slug} ${sign.slug} short`)
      assert.doesNotMatch(blob, /lotería|vas a enfermar|diagnóstico|debes invertir/i)
      // La lectura principal se escribe en lenguaje cotidiano: nada de casas, retrógrados ni efemérides.
      assert.doesNotMatch(`${blob} ${sign.consejo} ${sign.hook} ${sign.titulo}`, /casa \d|retrógrad|efemérid|grado|ascendente|tránsito|regente|UTC/i)
    }
  }
  // Las lecturas de dos semanas no se repiten.
  const [a, b] = WEEKS
  for (const sign of a.signs) {
    const other = b.signs.find((s) => s.slug === sign.slug)!
    assert.notEqual(sign.general, other.general, `${sign.slug} repeated`)
    assert.notEqual(sign.consejo, other.consejo, `${sign.slug} consejo repeated`)
  }
})

test('method guide states the tropical system and the dated sky', () => {
  const content = ASTROLOGIA_GUIA_2026.content ?? ''
  assert.ok(content.split(/\s+/).length >= 2000)
  assert.match(content, /## Preguntas frecuentes/)
  assert.match(content, /zodiaco tropical/)
  assert.match(content, /15:50 UTC/)
  assert.equal(ASTROLOGIA_GUIA_SEO.title.length <= 46, true)
  assert.equal(ASTROLOGIA_GUIA_SEO.description.length <= 155, true)
  assert.ok((ASTROLOGIA_GUIA_2026.excerpt ?? '').includes('zodiaco tropical'))
})
