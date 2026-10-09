import test from 'node:test'
import assert from 'node:assert/strict'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { TicketBlockModel } from '../lib/match-tickets'
import { buildTicketBlock, matchTicketInfoForSlug, type MatchTicketInfo } from '../lib/match-tickets'
import { GUARDIOLA_ARTICLE_2026 } from '../lib/guardiola-article-2026'

const base: MatchTicketInfo = {
  slug: 'demo', homeTeam: 'Local', awayTeam: 'Visitante', competition: 'Liga', venue: 'Estadio',
  startsAt: '2026-10-20T21:00:00+02:00', status: 'scheduled', ticketLink: null,
}
async function render(model: TicketBlockModel): Promise<string> {
  ;(globalThis as { React?: typeof React }).React = React
  const { default: MatchTicketBlock } = await import('../components/article/MatchTicketBlock')
  return renderToStaticMarkup(React.createElement(MatchTicketBlock, { model }))
}
const before = new Date('2026-10-10T10:00:00Z')

test('future match with a verified match link offers Comprar entradas', async () => {
  const m = buildTicketBlock({ ...base, ticketLink: { url: 'https://club.example/entradas/local-visitante', scope: 'match', source: 'la web oficial del Local', verifiedOn: '2026-10-09' } }, before)
  assert.equal(m.state.kind, 'buy')
  assert.equal(m.state.label, 'Comprar entradas')
  const html = await render(m)
  assert.match(html, /href="https:\/\/club\.example\/entradas\/local-visitante"/)
  assert.match(html, /target="_blank"/)
  assert.match(html, /rel="noopener noreferrer"/)
  assert.match(html, /pestaña nueva/)
})

test('club-level link says Ver entradas en la web oficial and explains availability', () => {
  const m = buildTicketBlock({ ...base, ticketLink: { url: 'https://club.example/entradas', scope: 'club', source: 'el Local', verifiedOn: '2026-10-09' } }, before)
  assert.equal(m.state.kind, 'official-site')
  assert.equal(m.state.label, 'Ver entradas en la web oficial')
  assert.match(m.state.note, /disponibilidad/)
})

test('missing or unsafe link is non-interactive Entradas no disponibles', async () => {
  for (const ticketLink of [null, { url: 'http://insecure.example', scope: 'match' as const, source: 'x', verifiedOn: '2026-10-09' }, { url: 'javascript:alert(1)', scope: 'club' as const, source: 'x', verifiedOn: '2026-10-09' }]) {
    const m = buildTicketBlock({ ...base, ticketLink }, before)
    assert.equal(m.state.kind, 'unavailable')
    const html = await render(m)
    assert.doesNotMatch(html, /<a /)
    assert.match(html, /Entradas no disponibles/)
  }
})

test('started, finished and cancelled matches never offer purchase', async () => {
  const link = { url: 'https://club.example/entradas/x', scope: 'match' as const, source: 'el Local', verifiedOn: '2026-10-09' }
  const cases: [MatchTicketInfo, Date, string][] = [
    [{ ...base, ticketLink: link }, new Date('2026-10-20T19:30:00Z'), 'started'],
    [{ ...base, ticketLink: link }, new Date('2026-10-21T00:00:00Z'), 'finished'],
    [{ ...base, status: 'finished', ticketLink: link }, before, 'finished'],
    [{ ...base, status: 'cancelled', ticketLink: link }, before, 'cancelled'],
    [{ ...base, status: 'postponed', ticketLink: link }, before, 'postponed'],
  ]
  for (const [info, now, kind] of cases) {
    const m = buildTicketBlock(info, now)
    assert.equal(m.state.kind, kind)
    assert.doesNotMatch(await render(m), /<a |Comprar entradas/)
  }
})

test('kickoff is evaluated in the Madrid time zone', () => {
  const m = buildTicketBlock(base, before)
  assert.match(m.whenLabel ?? '', /martes, 20 de octubre de 2026.*21:00.*hora de Madrid/)
})

test('registry covers match articles, with no unverified links, and skips other articles', () => {
  const slugs = ['castellon-ad-ceuta', 'girona-mallorca-laliga-hypermotion', 'portugal-noruega-nations-league', 'barcelona-real-madrid-femenino-7-0', 'malaga-espanyol-laliga-jornada-8-2026', 'levante-sevilla-laliga-jornada-8-2026']
  for (const slug of slugs) {
    const info = matchTicketInfoForSlug(slug)
    assert.ok(info, slug)
    assert.equal(info.ticketLink, null)
    assert.notEqual(buildTicketBlock(info, new Date('2026-10-09T07:00:00Z')).state.kind, 'buy')
  }
  assert.equal(buildTicketBlock(matchTicketInfoForSlug('castellon-ad-ceuta')!).state.kind, 'finished')
  assert.equal(buildTicketBlock(matchTicketInfoForSlug('malaga-espanyol-laliga-jornada-8-2026')!, new Date('2026-10-09T07:00:00Z')).state.kind, 'unavailable')
  assert.equal(matchTicketInfoForSlug('novedades-peugeot-2026'), null)
  assert.equal(matchTicketInfoForSlug(GUARDIOLA_ARTICLE_2026.slug), null)
})
