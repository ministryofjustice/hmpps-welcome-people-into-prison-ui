import nock from 'nock'
import type { Prison } from 'welcome'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import PrisonRegisterClient from './prisonRegisterClient'
import config from '../config'
import type { RedisClient } from './redisClient'

describe('PrisonRegisterClient', () => {
  let prisonRegisterClient: PrisonRegisterClient
  let mockRedisClient: jest.Mocked<RedisClient>
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  const token = 'token-1'
  const prisonId = 'MDI'

  beforeEach(() => {
    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
    } as unknown as jest.Mocked<RedisClient>

    mockAuthenticationClient = {
      getSystemClientToken: jest.fn().mockResolvedValue({ access_token: token, expires_in: 300 }),
    } as unknown as jest.Mocked<AuthenticationClient>

    config.apis.prisonRegister.url = 'http://localhost:8080'
    prisonRegisterClient = new PrisonRegisterClient(mockRedisClient, mockAuthenticationClient)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getPrison', () => {
    it('should make a GET request to /prisons/id/:id using the provided token and return the prison data', async () => {
      const prison: Prison = {
        prisonName: 'Moorland (HMP & YOI)',
      }

      nock(config.apis.prisonRegister.url)
        .get(`/prisons/id/${prisonId}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, prison)

      const result = await prisonRegisterClient.prisons.getPrison(token, { prisonId })

      expect(result).toEqual(prison)
    })
  })
})
