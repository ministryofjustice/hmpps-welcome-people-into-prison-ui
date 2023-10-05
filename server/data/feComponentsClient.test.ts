import nock from 'nock'
import config from '../config'
import FeComponentsClient, { Component } from './feComponentsClient'

describe('feComponentsClient', () => {
  let fakeComponentsApi: nock.Scope
  let componentsClient: FeComponentsClient
  const token = 'token-1'

  beforeEach(() => {
    fakeComponentsApi = nock(config.apis.frontendComponents.url)
    componentsClient = new FeComponentsClient(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getComponents', () => {
    it('should return data from api', async () => {
      const response: { data: { header: Component; footer: Component } } = {
        data: {
          header: {
            html: '<header></header>',
            css: [],
            javascript: [],
          },
          footer: {
            html: '<footer></footer>',
            css: [],
            javascript: [],
          },
        },
      }

      fakeComponentsApi
        .get('/components?component=header&component=footer')
        .matchHeader('x-user-token', token)
        .reply(200, response)

      const output = await componentsClient.getComponents(['header', 'footer'], token)
      expect(output).toEqual(response)
    })
  })
})
