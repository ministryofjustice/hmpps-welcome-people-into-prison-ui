import { RedisClient } from './redisClient'
import { RedisTokenStore } from './tokenStore'

const redisClient = {
  get: jest.fn(),
  set: jest.fn(),
  on: jest.fn(),
  connect: jest.fn(),
  isOpen: true,
} as unknown as jest.Mocked<RedisClient>

describe('tokenStore', () => {
  let tokenStore: RedisTokenStore

  beforeEach(() => {
    tokenStore = new RedisTokenStore(redisClient as unknown as RedisClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('get token', () => {
    it('Can retrieve token', async () => {
      redisClient.get.mockResolvedValue('token-1')

      await expect(tokenStore.getToken('user-1')).resolves.toBe('token-1')

      expect(redisClient.get).toHaveBeenCalledWith('systemToken:user-1')
    })

    it('Decodes a token returned as a buffer', async () => {
      redisClient.get.mockResolvedValue(Buffer.from('token-1'))

      await expect(tokenStore.getToken('user-1')).resolves.toBe('token-1')
    })

    it('Preserves a missing token', async () => {
      redisClient.get.mockResolvedValue(null)

      await expect(tokenStore.getToken('user-1')).resolves.toBeNull()
    })

    it('Connects when no connection calling getToken', async () => {
      ;(redisClient as unknown as Record<string, boolean>).isOpen = false

      await tokenStore.getToken('user-1')

      expect(redisClient.connect).toHaveBeenCalledWith()
    })
  })

  describe('set token', () => {
    it('Can set token', async () => {
      await tokenStore.setToken('user-1', 'token-1', 10)

      expect(redisClient.set).toHaveBeenCalledWith('systemToken:user-1', 'token-1', { EX: 10 })
    })

    it('Connects when no connection calling set token', async () => {
      ;(redisClient as unknown as Record<string, boolean>).isOpen = false

      await tokenStore.setToken('user-1', 'token-1', 10)

      expect(redisClient.connect).toHaveBeenCalledWith()
    })
  })
})
