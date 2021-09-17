import nock from 'nock'
import moment from 'moment'
import type { Movement } from 'welcome'
import WelcomeClient from './welcomeClient'
import config from '../config'

describe('welcomeClient', () => {
  let fakeWelcomeApi: nock.Scope
  let welcomeClient: WelcomeClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.welcome.url = 'http://localhost:8080'
    fakeWelcomeApi = nock(config.apis.welcome.url)
    welcomeClient = new WelcomeClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.cleanAll()
  })

  describe('getIncomingMovements', () => {
    const activeCaseLoadId = 'MDI'
    const date = moment()
    const incomingMovements: Movement[] = []
    it('should return data from api', async () => {
      fakeWelcomeApi
        .get(`/incoming-moves/${activeCaseLoadId}?date=${date.format('YYYY-MM-DD')}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, incomingMovements)

      const output = await welcomeClient.getIncomingMovements(activeCaseLoadId, date)
      expect(output).toEqual(incomingMovements)
    })
  })
})
