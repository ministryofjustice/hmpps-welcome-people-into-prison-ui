import { Response, Request } from 'express'
import feComponentsMiddleware from './feComponentsMiddleware'
import { createMockFeComponentService } from '../services/__testutils/mocks'
import logger from '../../logger'
import { Component } from '../data/feComponentsClient'

jest.mock('../services/feComponentsService')
jest.mock('../../logger')

const feComponentsService = createMockFeComponentService()
feComponentsService.getFeComponents = jest.fn().mockResolvedValue({})

let req: Request
let res: Response
const next = jest.fn()

describe('feComponentsMiddleware', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    res = { locals: { user: {} } } as unknown as Response
    res.locals.user.token = 'token-1'
  })

  test('Should call components service correctly', async () => {
    const header = { html: '<header></header>', javascript: [], css: [] } as Component
    const footer = { html: '<footer></footer>', javascript: [], css: [] } as Component
    feComponentsService.getFeComponents.mockResolvedValue({ header, footer })

    await feComponentsMiddleware(feComponentsService)(req, res, next)

    expect(feComponentsService.getFeComponents).toHaveBeenCalledWith(['header', 'footer'], 'token-1')
    expect(res.locals.feComponents).toEqual({
      header: '<header></header>',
      footer: '<footer></footer>',
      cssIncludes: [],
      jsIncludes: [],
    })
    expect(next).toHaveBeenCalled()
  })

  test('Should log errors', async () => {
    const error = new Error('Failed to retrieve front end components')
    feComponentsService.getFeComponents.mockRejectedValue(error)

    await feComponentsMiddleware(feComponentsService)(req, res, next)
    expect(logger.error).toBeCalledWith(error, 'Failed to retrieve front end components')
  })
})
