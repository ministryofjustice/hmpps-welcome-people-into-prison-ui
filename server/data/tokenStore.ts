/* eslint max-classes-per-file: ["error", 2] */

import type { RedisClient } from './redisClient'

export interface TokenStore {
  setToken(key: string, token: string, durationSeconds: number): Promise<void>

  getToken(key: string): Promise<string>
}

export class RedisTokenStore implements TokenStore {
  private readonly prefix = 'systemToken:'

  constructor(private readonly client: RedisClient) {}

  private async ensureConnected() {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    await this.ensureConnected()
    await this.client.set(`${this.prefix}${key}`, token, { EX: durationSeconds })
  }

  public async getToken(key: string): Promise<string> {
    await this.ensureConnected()
    return this.client.get(`${this.prefix}${key}`)
  }
}

export class InMemoryTokenStore implements TokenStore {
  constructor(private readonly tokenMap: Map<string, string> = new Map()) {}

  public async setToken(key: string, token: string): Promise<void> {
    this.tokenMap.set(key, token)
  }

  public async getToken(key: string): Promise<string> {
    return this.tokenMap.get(key)
  }
}
