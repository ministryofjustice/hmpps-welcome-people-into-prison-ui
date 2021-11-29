import PrisonService from './prisonService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import WelcomeClient from '../data/welcomeClient'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/welcomeClient')

const token = 'some token'

describe('Expected arrivals service', () => {
  const welcomeClient = new WelcomeClient(null) as jest.Mocked<WelcomeClient>
  const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
  let service: PrisonService

  const WelcomeClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    WelcomeClientFactory.mockReturnValue(welcomeClient)
    service = new PrisonService(hmppsAuthClient, WelcomeClientFactory)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
    welcomeClient.getPrison.mockResolvedValue({
      description: 'Moorland (HMP & YOI)',
    })
  })

  describe('getPrison', () => {
    it('Calls upstream service correctly', async () => {
      await service.getPrison('MDI')

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getPrison).toBeCalledWith('MDI')
    })

    it('Should return correct data', async () => {
      const result = await service.getPrison('MDI')

      expect(result).toStrictEqual({
        description: 'Moorland (HMP & YOI)',
      })
    })
  })
})
