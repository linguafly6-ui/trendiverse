import test from 'node:test'
import assert from 'node:assert/strict'
import { CATEGORIES } from '../lib/constants'
import { CONCERTS, concertsFor, isCurrent } from '../lib/concerts'
import { CONCERT_TICKETS, ticketLabel, ticketNote, ticketsFor } from '../lib/concert-tickets'
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
  assert.match(CONCIERTOS_AGENDA_2026.content ?? '', /página donde se venden las entradas/)
})

test('each concert links to the page that sells its tickets', () => {
  assert.deepEqual(Object.keys(CONCERT_TICKETS).sort(), CONCERTS.map((concert) => concert.id).sort())
  const banned = /stubhub|ventaoficial\.es|laganzua|concerts50\.com|jambase|madcooltickets\.com|sonar\.es\/(?:es|en)\/tickets/i
  const urls = new Set<string>()
  for (const concert of CONCERTS) {
    const tickets = ticketsFor(concert)
    assert.equal(tickets.url.startsWith('https://'), true, concert.id)
    if (tickets.url === concert.sourceUrl) {
      assert.doesNotMatch(concert.sourceName, /EL PAÍS|EFE|^AS$|Turismo|Concerts50|Revista|Rock For/, concert.id)
    }
    assert.doesNotMatch(tickets.url, banned, concert.id)
    assert.equal(urls.has(tickets.url), false, tickets.url)
    urls.add(tickets.url)
    assert.match(ticketNote(concert), /\S/)
    assert.match(ticketLabel(concert), /entradas/)
    if (tickets.state !== 'abierta') assert.equal(ticketLabel(concert), 'Página de entradas', concert.id)
  }
  assert.equal(ticketsFor({ id: 'oasis-barcelona-2027' }).state, 'agotadas')
  assert.equal(ticketsFor({ id: 'quevedo-madrid-2027' }).state, 'agotadas')
  assert.equal(ticketsFor({ id: 'sonar-2027' }).state, 'cerrada')
  assert.equal(ticketsFor({ id: 'mad-cool-2027' }).url, 'https://www.madcoolfestival.es/tickets')
  assert.equal(ticketsFor({ id: 'bbk-live-2027' }).url, 'https://bilbaobbklive.com/tickets/')
  assert.doesNotMatch(ticketsFor({ id: 'bbk-live-2027' }).url, /feverup/)
  assert.doesNotMatch(ticketsFor({ id: 'cano-coruna-2027' }).url, /baila\.fm/)
  assert.match(ticketsFor({ id: 'shakira-madrid-2026' }).url, /livenation\.es\/event\/shakira/)
  assert.match(ticketsFor({ id: 'harry-styles-madrid-2027' }).note ?? '', /2 de agosto/)
})
