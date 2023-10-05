import { createFeComponentsClient } from '../data/__testutils/mocks'
import { AvailableComponent, Component } from '../data/feComponentsClient'
import FeComponentsService from './feComponentsService'

jest.mock('../data')

const FeComponentsClientBuilder = jest.fn()
const token = 'token'
const components = ['header', 'footer']
const feComponentsClient = createFeComponentsClient()
let feComponentsService: FeComponentsService

beforeEach(() => {
  FeComponentsClientBuilder.mockReturnValue(feComponentsClient)
  feComponentsService = new FeComponentsService(FeComponentsClientBuilder)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('feComponentsService', () => {
  describe('getFeComponents', () => {
    it('should use token', async () => {
      feComponentsClient.getComponents.mockResolvedValue({} as Record<AvailableComponent, Component>)

      await feComponentsService.getFeComponents(components as AvailableComponent[], token)
      expect(FeComponentsClientBuilder).toBeCalledWith(token)
    })
    it('should call upstream client correctly', async () => {
      const response = {
        header: {
          html: '',
          css: [],
          javascript: [],
        } as Component,
        footer: {
          html: '',
          css: [],
          javascript: [],
        } as Component,
      }
      feComponentsClient.getComponents.mockResolvedValue(response)
      const result = await feComponentsService.getFeComponents(components as AvailableComponent[], token)
      expect(result).toEqual(response)
    })
  })
})
