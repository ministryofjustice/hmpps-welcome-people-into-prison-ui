import type { RedisClient } from './redisClient'

/**
 * This isn't particularly robust, and there is a failure mode if a replica becomes leader before
 * the lock has been written back across a majority of nodes.
 * https://redis.io/docs/manual/patterns/distributed-locks/
 *
 * A more robust solution would follow Redlock algorithm but the complexity does not warrant the
 * extra effort for a short term solution.
 */
export default class LockManager {
  private readonly prefix = 'lock:'

  constructor(private readonly client: RedisClient) {}

  private async ensureConnected() {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }

  public async lock(key: string, durationSeconds: number): Promise<boolean> {
    await this.ensureConnected()
    const result = await this.client.set(`${this.prefix}${key}`, 'LOCKED', { NX: true, EX: durationSeconds })
    return Boolean(result)
  }

  public async unlock(key: string): Promise<boolean> {
    await this.ensureConnected()
    const result = await this.client.del(`${this.prefix}${key}`)
    return Boolean(result)
  }
}
