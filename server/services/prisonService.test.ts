import { jest } from '@jest/globals'
import PrisonService from './prisonService'
import PrisonRegisterClient from '../data/prisonRegisterClient'
import { createPrison } from '../data/__testutils/testObjects'

function deepMock(object: any, returnValue?: any): object | jest.Mock {
  if (typeof object === 'object') {
    return Object.fromEntries(Object.entries(object).map(([k, n]) => [k, deepMock(n, returnValue)]))
  }

  if (typeof object === 'function') {
    return jest.fn().mockReturnValue(returnValue)
  }

  return object
}

describe('PrisonService', () => {
  const token = 'some-token'
  const prisonId = 'MDI'
  const prison = createPrison()

  let prisonRegisterClient: jest.Mocked<PrisonRegisterClient>
  let prisonService: PrisonService

  beforeEach(() => {
    prisonRegisterClient = jest.mocked(new PrisonRegisterClient(null, null))
    prisonRegisterClient.prisons = deepMock(prisonRegisterClient.prisons) as typeof prisonRegisterClient.prisons
    prisonRegisterClient.prisons.getPrison.mockResolvedValue(prison)

    prisonService = new PrisonService(prisonRegisterClient)
  })

  describe('getPrison', () => {
    it('calls the correct API client function', async () => {
      await prisonService.getPrison(token, prisonId)

      expect(prisonRegisterClient.prisons.getPrison).toHaveBeenCalledWith(token, { prisonId })
    })

    it('returns the expected data', async () => {
      const result = await prisonService.getPrison(token, prisonId)

      expect(result).toEqual(prison)
    })
  })
})
