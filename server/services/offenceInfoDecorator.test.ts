import OffenceInfoDecorator from './offenceInfoDecorator'
import { createArrival } from '../data/__testutils/testObjects'

describe('OffenceInfoDecorator', () => {
  const service = new OffenceInfoDecorator()
  describe('decorateSingle', () => {
    test('Included offence from court', async () => {
      const arrival = createArrival({ fromLocationType: 'COURT' })
      const result = service.decorateSingle(arrival)
      expect(result.offence).toBe('Burglary')
    })

    test('Included offence from other location type', async () => {
      const arrival = createArrival({ fromLocationType: 'OTHER' })
      const result = service.decorateSingle(arrival)
      expect(result.offence).toBe('Burglary')
    })

    test('Included offence from prison', async () => {
      const arrival = createArrival({ fromLocationType: 'PRISON' })
      const result = service.decorateSingle(arrival)
      expect(result.offence).toBe('Burglary')
    })
    test('Included offence from police', async () => {
      const arrival = createArrival({ fromLocationType: 'CUSTODY_SUITE' })
      const result = service.decorateSingle(arrival)
      expect(result.offence).toBe(null)
    })

    test('No offence from court', async () => {
      const arrival = createArrival({ offence: null })
      const result = service.decorateSingle(arrival)
      expect(result.offence).toBe('Not available')
    })

    test('No offence from police', async () => {
      const arrival = createArrival({ offence: null, fromLocationType: 'CUSTODY_SUITE' })
      const result = service.decorateSingle(arrival)
      expect(result.offence).toBe(null)
    })

    test('Invalid offence from court', async () => {
      const arrivals = [
        createArrival({ offence: 'null' }),
        createArrival({ offence: 'unknown' }),
        createArrival({ offence: 'warrant' }),
        createArrival({ offence: 'not stated' }),
        createArrival({ offence: 'nk' }),
        createArrival({ offence: 'na' }),
        createArrival({ offence: 'n/a' }),
        createArrival({ offence: '.' }),
        createArrival({ offence: '..' }),
        createArrival({ offence: 'u/k' }),
      ]
      arrivals.forEach(arrival => {
        const result = service.decorateSingle(arrival)
        expect(result.offence).toBe('Not available')
      })
    })
    test('Invalid offence from police', async () => {
      const arrivals = [
        createArrival({ fromLocationType: 'CUSTODY_SUITE', offence: 'null' }),
        createArrival({ fromLocationType: 'CUSTODY_SUITE', offence: 'unknown' }),
        createArrival({ fromLocationType: 'CUSTODY_SUITE', offence: 'warrant' }),
        createArrival({ fromLocationType: 'CUSTODY_SUITE', offence: 'not stated' }),
        createArrival({ fromLocationType: 'CUSTODY_SUITE', offence: 'nk' }),
        createArrival({ fromLocationType: 'CUSTODY_SUITE', offence: 'na' }),
        createArrival({ fromLocationType: 'CUSTODY_SUITE', offence: 'n/a' }),
        createArrival({ fromLocationType: 'CUSTODY_SUITE', offence: '.' }),
        createArrival({ fromLocationType: 'CUSTODY_SUITE', offence: '..' }),
        createArrival({ fromLocationType: 'CUSTODY_SUITE', offence: 'u/k' }),
      ]
      arrivals.forEach(arrival => {
        const result = service.decorateSingle(arrival)
        expect(result.offence).toBe(null)
      })
    })
  })
})
