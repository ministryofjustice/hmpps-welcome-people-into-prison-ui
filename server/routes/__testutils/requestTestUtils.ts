import superAgent from 'superagent'
import { NextFunction, Request, Response } from 'express'
import { ValidationError } from '../../middleware/validationMiddleware'
import { StateOperations } from '../../utils/state'

const exampleUserDetails = {
  username: 'USER1',
  active: true,
  name: 'User 1',
  authSource: 'nomis',
  staffId: 123456,
  userId: '654321',
}
type CookieValues = Record<string, string>

type RequestParams = {
  userDetails?: unknown
  params?: Record<string, string>
  body?: Record<string, string>
  baseUrl?: string
  path?: string
  hostname?: string
  query?: Record<string, string>
  signedCookies?: Record<string, CookieValues>
  errors?: ValidationError[]
}

type ResponseParams = {
  locals?: unknown
}

export const mockRequest = ({
  userDetails = exampleUserDetails,
  params = {},
  query = {},
  body = {},
  signedCookies = {},
  baseUrl,
  path,
  hostname,
  errors = undefined,
}: RequestParams): jest.Mocked<Request> =>
  ({
    session: {
      userDetails,
    },
    signedCookies,
    query,
    params,
    flash: jest.fn().mockReturnValue([]),
    body,
    baseUrl,
    path,
    hostname,
    errors,
  } as unknown as jest.Mocked<Request>)

export const mockResponse = ({ locals = { context: {}, user: {} } }: ResponseParams): jest.Mocked<Response> =>
  ({
    locals,
    sendStatus: jest.fn(),
    send: jest.fn(),
    contentType: jest.fn(),
    set: jest.fn(),
    redirect: jest.fn(),
    render: jest.fn(),
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as jest.Mocked<Response>)

export const mockNext = (): NextFunction => jest.fn()

export const expectSettingCookie = <T>(
  res: superAgent.Response,
  stateOperations: StateOperations<T>
): jest.JestMatchers<T> => {
  const [cookie] = res.header['set-cookie']
  const [, name, value] = cookie.match(/^(.*?)=(.*?);/)

  expect(name).toBe(stateOperations.cookieName)

  const results = decodeURIComponent(value).match(/(\{.*\})/)
  return results ? expect(JSON.parse(results[1])) : expect(undefined)
}

export const stubRequestCookie = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signedCookiesProvider: jest.Mock<any, any>,
  stateOperations: StateOperations<T>,
  value: T
) => {
  signedCookiesProvider.mockReturnValue({
    [stateOperations.cookieName]: stateOperations.write(value),
  })
}

export type ExpectedCookie<T> = [stateOperations: StateOperations<T>, value: T]

export const stubRequestCookies = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signedCookiesProvider: jest.Mock<any, any>,
  cookies: ExpectedCookie<unknown>[]
) => {
  signedCookiesProvider.mockReturnValue(
    cookies.reduce((acc, [stateOperations, value]) => {
      acc[stateOperations.cookieName] = stateOperations.write(value)
      return acc
    }, {})
  )
}
