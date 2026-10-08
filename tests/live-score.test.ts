import test from 'node:test'
import assert from 'node:assert/strict'
import { findMatch } from '../lib/live-score'

const board = {
  events: [
    {
      competitions: [{
        competitors: [
          { homeAway: 'home', score: '0', team: { displayName: 'Deportivo Alavés' } },
          { homeAway: 'away', score: '0', team: { displayName: 'Atlético Madrid' } },
        ],
        venue: { fullName: 'Mendizorrotza' },
        league: { name: 'LaLiga' },
      }],
      status: { type: { state: 'pre', shortDetail: 'Scheduled' }, displayClock: '', period: 0 },
    },
    {
      competitions: [{
        competitors: [
          { homeAway: 'home', score: '1', team: { displayName: 'Real Sociedad' } },
          { homeAway: 'away', score: '2', team: { displayName: 'Deportivo' } },
        ],
        venue: { fullName: 'Reale Arena' },
        league: { name: 'LaLiga' },
      }],
      status: { type: { state: 'in', shortDetail: "67'" }, displayClock: "67'", period: 2 },
    },
  ],
}

test('findMatch requires both clubs and does not confuse Deportivo with Alavés', () => {
  const real = findMatch(board, 'Real Sociedad', 'Deportivo')
  assert.equal(real?.homeTeam, 'Real Sociedad')
  assert.equal(real?.awayTeam, 'Deportivo')
  assert.equal(real?.homeScore, 1)
  assert.equal(real?.awayScore, 2)
  assert.equal(real?.isLive, true)

  const alaves = findMatch(board, 'Alavés', 'Atlético Madrid')
  assert.equal(alaves?.homeTeam, 'Deportivo Alavés')
  assert.equal(alaves?.isPending, true)
  assert.equal(findMatch(board, 'Alavés', 'Deportivo'), null)
})
