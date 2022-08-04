import PrisonService from './prisonService'
import { createPrison } from '../data/__testutils/testObjects'
import { createMockHmppsAuthClient, createMockWelcomeClient } from '../data/__testutils/mocks'

const token = 'some token'

describe('Expected arrivals service', () => {
  const welcomeClient = createMockWelcomeClient()
  const hmppsAuthClient = createMockHmppsAuthClient()
  let service: PrisonService

  const WelcomeClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    WelcomeClientFactory.mockReturnValue(welcomeClient)
    service = new PrisonService(hmppsAuthClient, WelcomeClientFactory)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  describe('getPrison', () => {
    const prison = createPrison()

    beforeEach(() => {
      welcomeClient.getPrison.mockResolvedValue(prison)
    })

    it('Calls upstream service correctly', async () => {
      await service.getPrison('MDI')

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getPrison).toBeCalledWith('MDI')
    })

    it('Should return correct data', async () => {
      const result = await service.getPrison('MDI')

      expect(result).toStrictEqual(prison)
    })
  })
})
