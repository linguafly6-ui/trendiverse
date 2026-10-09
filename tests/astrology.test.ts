import test from 'node:test'
import assert from 'node:assert/strict'
import { DISCLAIMER, HOUSES, SIGNS, SKY, solarHouse, WEEK_LABEL } from '../lib/astrology'
import { ASTROLOGIA_GUIA_2026, ASTROLOGIA_GUIA_SEO } from '../lib/astrologia-guia-2026'

test('weekly horoscope uses one solar-sign reading per sign', () => {
  assert.equal(SIGNS.length, 12)
  assert.equal(new Set(SIGNS.map((s) => s.slug)).size, 12)
  assert.match(WEEK_LABEL, /8 al 14 de octubre de 2026/)
  assert.match(SKY.newMoon, /15:50 UTC/)
  assert.match(SKY.venus, /Escorpio/)
  assert.match(DISCLAIMER, /entretenimiento/i)
  assert.doesNotMatch(DISCLAIMER, /ascendente|casas/i)
  assert.equal(solarHouse('aries', 'libra'), 7)
  assert.equal(solarHouse('libra', 'libra'), 1)
  assert.equal(solarHouse('escorpio', 'libra'), 12)
  assert.equal(solarHouse('capricornio', 'aries'), 4)
  assert.equal(solarHouse('piscis', 'leo'), 6)

  for (const sign of SIGNS) {
    assert.equal(sign.newMoonHouse, solarHouse(sign.slug, 'libra'))
    assert.equal(sign.venusHouse, solarHouse(sign.slug, 'escorpio'))
    assert.equal(sign.saturnHouse, solarHouse(sign.slug, 'aries'))
    assert.equal(sign.marsHouse, solarHouse(sign.slug, 'leo'))
    assert.ok(HOUSES[sign.newMoonHouse])
    assert.ok(sign.seoTitle.length <= 46, `${sign.slug} title ${sign.seoTitle.length}`)
    assert.ok(sign.description.length <= 155, `${sign.slug} description ${sign.description.length}`)
    assert.ok(sign.titulo.length > 0 && sign.titulo.length <= 60, `${sign.slug} titulo`)
    assert.ok(sign.hook.length <= 70, `${sign.slug} hook ${sign.hook.length}`)
    assert.ok(sign.consejo.length >= 30, `${sign.slug} consejo`)
    const blob = `${sign.general} ${sign.relaciones} ${sign.trabajo} ${sign.dinero} ${sign.ritmo}`
    assert.ok(blob.split(/\s+/).length >= 250, `${sign.slug} short`)
    assert.doesNotMatch(blob, /lotería|vas a enfermar|diagnóstico|debes invertir/i)
    // La lectura principal se escribe en lenguaje cotidiano: nada de casas, retrógrados ni efemérides.
    assert.doesNotMatch(`${blob} ${sign.consejo} ${sign.hook} ${sign.titulo}`, /casa \d|retrógrad|efemérid|grado|ascendente|tránsito|regente|UTC/i)
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
