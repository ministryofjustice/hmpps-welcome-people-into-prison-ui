import type { PotentialMatch } from 'welcome'
import { createPotentialMatch } from '../data/__testutils/testObjects'
import { ArrivalInfo, MatchType, MatchTypeDecorator } from './matchTypeDecorator'

describe('MatchTypeDecorator', () => {
  const service = new MatchTypeDecorator()

  const potentialMatch = {} as PotentialMatch
  const arrival = ({
    prisonNumber,
    pncNumber,
    potentialMatches,
    fromLocationType = 'OTHER',
    isCurrentPrisoner = false,
  }: Partial<ArrivalInfo>): ArrivalInfo => ({
    prisonNumber,
    pncNumber,
    potentialMatches,
    fromLocationType,
    isCurrentPrisoner,
  })

  describe('getMatchType', () => {
    test('insufficient info', async () => {
      const result = service.getMatchType(arrival({}))
      expect(result).toBe(MatchType.INSUFFICIENT_INFO)
    })

    test('court return match', async () => {
      const result = service.getMatchType(
        arrival({
          prisonNumber: 'A1234AA',
          potentialMatches: [
            createPotentialMatch({
              arrivalType: 'FROM_COURT',
            }),
          ],
        }),
      )
      expect(result).toBe(MatchType.COURT_RETURN)
    })

    test('no match - undefined matches', async () => {
      const result = service.getMatchType(arrival({ prisonNumber: 'A1234AA', pncNumber: '01/12345A' }))
      expect(result).toBe(MatchType.NO_MATCH)
    })

    test('no match - empty matches', async () => {
      const result = service.getMatchType(
        arrival({ prisonNumber: 'A1234AA', pncNumber: '01/12345A', potentialMatches: [] }),
      )
      expect(result).toBe(MatchType.NO_MATCH)
    })

    test('single match', async () => {
      const result = service.getMatchType(
        arrival({ prisonNumber: 'A1234AA', pncNumber: '01/12345A', potentialMatches: [potentialMatch] }),
      )
      expect(result).toBe(MatchType.SINGLE_MATCH)
    })

    test('mutiple potential matches', async () => {
      const result = service.getMatchType(
        arrival({
          prisonNumber: 'A1234AA',
          pncNumber: '01/12345A',
          potentialMatches: [potentialMatch, potentialMatch],
        }),
      )
      expect(result).toBe(MatchType.MULTIPLE_POTENTIAL_MATCHES)
    })
  })

  describe('decorate', () => {
    test('insufficient info', async () => {
      const [result] = service.decorate([arrival({})])
      expect(result.matchType).toBe(MatchType.INSUFFICIENT_INFO)
    })
  })
})
