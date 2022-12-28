import LockManager from './lockManager'
import { RedisClient } from './redisClient'

const redisClient = {
  set: jest.fn(),
  connect: jest.fn(),
  isOpen: true,
} as unknown as jest.Mocked<RedisClient>

describe('lockManager', () => {
  let lockManager: LockManager

  beforeEach(() => {
    lockManager = new LockManager(redisClient as unknown as RedisClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('lock', () => {
    it('Calls redis client correctly', async () => {
      ;(redisClient as unknown as Record<string, boolean>).isOpen = true
      await lockManager.lock('some-lock-id', 10)

      expect(redisClient.set).toHaveBeenCalledWith('lock:some-lock-id', 'LOCKED', {
        NX: true,
        EX: 10,
      })
      expect(redisClient.connect).not.toHaveBeenCalledWith()
    })

    it('Can acquire lock', async () => {
      redisClient.set.mockResolvedValue('OK')

      const result = await lockManager.lock('some-lock-id', 10)

      expect(result).toStrictEqual(true)
    })

    it('Fail to acquire lock', async () => {
      redisClient.set.mockResolvedValue(null)

      const result = await lockManager.lock('some-lock-id', 10)

      expect(result).toStrictEqual(false)
    })

    it('Connects when no connection calling set token', async () => {
      ;(redisClient as unknown as Record<string, boolean>).isOpen = false

      await lockManager.lock('some-lock-id', 10)

      expect(redisClient.connect).toHaveBeenCalledWith()
    })
  })
})
