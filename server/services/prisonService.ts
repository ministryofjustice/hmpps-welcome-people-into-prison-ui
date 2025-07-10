import type { Prison } from 'welcome'
import PrisonRegisterClient from '../data/prisonRegisterClient'

export default class PrisonService {
  constructor(private readonly prisonRegisterApiClient: PrisonRegisterClient) {}

  public async getPrison(token: string, prisonId: string): Promise<Prison> {
    return this.prisonRegisterApiClient.prisons.getPrison(token, { prisonId })
  }
}
