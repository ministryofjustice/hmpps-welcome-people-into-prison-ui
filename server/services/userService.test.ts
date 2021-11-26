import { UserCaseLoad } from 'welcome'
import UserService from './userService'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import WelcomeClient from '../data/welcomeClient'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/welcomeClient')

const token = 'some token'

describe('User service', () => {
  const welcomeClient = new WelcomeClient(null) as jest.Mocked<WelcomeClient>
  const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
  let service: UserService

  const WelcomeClientFactory = jest.fn()

  const userCaseLoads: UserCaseLoad[] = [
    {
      caseLoadId: 'MDI',
      description: 'Moorland Closed (HMP & YOI)',
    },
    {
      caseLoadId: 'NMI',
      description: 'Nottingham (HMP)',
    },
  ]

  beforeEach(() => {
    WelcomeClientFactory.mockReturnValue(welcomeClient)
    service = new UserService(hmppsAuthClient, WelcomeClientFactory)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
    welcomeClient.getUserCaseLoads.mockResolvedValue(userCaseLoads)
  })

  describe('getUser', () => {
    it('Retrieves and formats user name', async () => {
      hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith' } as User)

      const result = await service.getUser(token)

      expect(result.displayName).toEqual('John Smith')
    })

    it('Propagates error', async () => {
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

      await expect(service.getUser(token)).rejects.toEqual(new Error('some error'))
    })
  })

  describe('getUserCaseLoads', () => {
    it('Calls upstream service correctly', async () => {
      await service.getUserCaseLoads(token)

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getUserCaseLoads).toBeCalledWith()
    })

    it('Should return correct data', async () => {
      const result = await service.getUserCaseLoads(token)

      expect(result).toStrictEqual([
        {
          caseLoadId: 'MDI',
          description: 'Moorland Closed (HMP & YOI)',
        },
        {
          caseLoadId: 'NMI',
          description: 'Nottingham (HMP)',
        },
      ])
    })
  })
})
