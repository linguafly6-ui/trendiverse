import test from 'node:test'
import assert from 'node:assert/strict'
import { CATEGORIES } from '../lib/constants'
import { CONCERTS, concertsFor, isCurrent } from '../lib/concerts'
import { CONCIERTOS_AGENDA_2026, CONCIERTOS_AGENDA_SEO } from '../lib/conciertos-agenda-2026'

test('concert agenda is sourced, current and does not invent a full club census', () => {
  assert.ok(CONCERTS.length >= 30)
  assert.equal(new Set(CONCERTS.map((c) => c.id)).size, CONCERTS.length)
  for (const concert of CONCERTS) {
    assert.ok(isCurrent(concert), concert.id)
    assert.ok(concert.sourceUrl.startsWith('https://'), concert.id)
    assert.ok(concert.artist && concert.city && concert.venue && concert.when, concert.id)
    assert.match(concert.detail, /\S/)
  }
  const byId = Object.fromEntries(CONCERTS.map((c) => [c.id, c]))
  assert.equal(byId['shakira-madrid-2026'].start, '2026-10-09')
  assert.equal(byId['primavera-sound-2027'].start, '2027-06-02')
  assert.equal(byId['primavera-sound-2027'].end, '2027-06-06')
  assert.match(byId['primavera-sound-2027'].detail, /Doechii/)
  assert.equal(byId['sonar-2027'].start, '2027-06-17')
  assert.equal(byId['bbk-live-2027'].start, '2027-07-08')
  assert.equal(byId['bbk-live-2027'].venue, 'Kobetamendi')
  assert.equal(byId['oasis-barcelona-2027'].start, '2027-07-10')
  assert.equal(byId['oasis-barcelona-2027'].end, '2027-07-11')
  assert.equal(byId['mad-cool-2027'].datesPending, true)
  assert.doesNotMatch(byId['mad-cool-2027'].detail, /Foo Fighters/)
  assert.equal(byId['quevedo-madrid-2027'].when.includes('17, 18 y 20 de mayo'), true)
  assert.equal(concertsFor({ tier: 'confirmado' }).every((c) => c.tier === 'confirmado'), true)
  assert.equal(concertsFor({ ciudad: 'Bilbao' }).some((c) => c.id === 'bbk-live-2027'), true)
  const cat = CATEGORIES.find((c) => c.slug === 'conciertos')
  assert.ok(cat)
  assert.ok((cat?.seoTitle.length ?? 99) <= 46)
  assert.equal(CONCIERTOS_AGENDA_SEO.title.length <= 46, true)
  assert.equal(CONCIERTOS_AGENDA_SEO.description.length <= 155, true)
  assert.ok((CONCIERTOS_AGENDA_2026.content ?? '').split(/\s+/).length >= 2000)
  assert.match(CONCIERTOS_AGENDA_2026.content ?? '', /## Preguntas frecuentes/)
})
