import PrisonService from './prisonService'
import { createPrison } from '../data/__testutils/testObjects'
import { createMockHmppsAuthClient, createMockPrisonRegisterClient } from '../data/__testutils/mocks'

const token = 'some token'

describe('Expected arrivals service', () => {
  const prisonRegisterClient = createMockPrisonRegisterClient()
  const hmppsAuthClient = createMockHmppsAuthClient()
  let service: PrisonService

  const PrisonRegisterClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    PrisonRegisterClientFactory.mockReturnValue(prisonRegisterClient)
    service = new PrisonService(hmppsAuthClient, PrisonRegisterClientFactory)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  describe('getPrison', () => {
    const prison = createPrison()

    beforeEach(() => {
      prisonRegisterClient.getPrison.mockResolvedValue(prison)
    })

    it('Calls upstream service correctly', async () => {
      await service.getPrison('MDI')

      expect(PrisonRegisterClientFactory).toBeCalledWith(token)
      expect(prisonRegisterClient.getPrison).toBeCalledWith('MDI')
    })

    it('Should return correct data', async () => {
      const result = await service.getPrison('MDI')

      expect(result).toStrictEqual(prison)
    })
  })
})
