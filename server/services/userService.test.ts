import UserService from './userService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import WelcomeClient from '../data/welcomeClient'
import { createUser, createUserCaseLoad } from '../data/__testutils/testObjects'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/welcomeClient')

const token = 'some token'

describe('User service', () => {
  const welcomeClient = new WelcomeClient(null) as jest.Mocked<WelcomeClient>
  const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
  let service: UserService

  const WelcomeClientFactory = jest.fn()

  beforeEach(() => {
    WelcomeClientFactory.mockReturnValue(welcomeClient)
    service = new UserService(hmppsAuthClient, WelcomeClientFactory)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  describe('getUser', () => {
    it('Retrieves and formats user name', async () => {
      const user = createUser()

      hmppsAuthClient.getUser.mockResolvedValue(user)

      const result = await service.getUser(token)

      expect(result).toStrictEqual({ ...user, displayName: 'John Smith' })
    })

    it('Propagates error', async () => {
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

      await expect(service.getUser(token)).rejects.toEqual(new Error('some error'))
    })
  })

  describe('getUserCaseLoads', () => {
    const caseLoad = createUserCaseLoad()

    beforeEach(() => {
      welcomeClient.getUserCaseLoads.mockResolvedValue([caseLoad])
    })

    it('Calls upstream service correctly', async () => {
      await service.getUserCaseLoads(token)

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getUserCaseLoads).toBeCalledWith()
    })

    it('Should return correct data', async () => {
      const result = await service.getUserCaseLoads(token)

      expect(result).toStrictEqual([caseLoad])
    })
  })
})
