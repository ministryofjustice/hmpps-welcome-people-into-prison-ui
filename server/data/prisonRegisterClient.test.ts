import nock from 'nock'
import type { Prison } from 'welcome'
import PrisonRegisterClient from './prisonRegisterClient'
import config from '../config'

describe('prisonRegisterClient', () => {
  let fakePrisonRegisterApi: nock.Scope
  let prisonRegisterClient: PrisonRegisterClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.prisonRegister.url = 'http://localhost:8080'
    fakePrisonRegisterApi = nock(config.apis.prisonRegister.url)
    prisonRegisterClient = new PrisonRegisterClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('getPrison', () => {
    const prison: Prison = {
      prisonName: 'Moorland (HMP & YOI)',
    }
    const prisonId = 'MDI'

    it('should return data from api', async () => {
      fakePrisonRegisterApi
        .get(`/prisons/id/${prisonId}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, prison)

      const output = await prisonRegisterClient.getPrison(prisonId)
      expect(output).toEqual(prison)
    })
  })
})
