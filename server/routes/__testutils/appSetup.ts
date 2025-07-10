import express, { Express } from 'express'
import cookieParser from 'cookie-parser'
import cookieSession from 'cookie-session'
import createError from 'http-errors'
import path from 'path'
import config from '../../config'

import wpipRoutes from '../index'
import bodyScanRoutes from '../../bodyscan/routes'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import * as auth from '../../authentication/auth'
import type { Services } from '../../services'
import Role from '../../authentication/role'
import { StateOperations } from '../../utils/state'
import { stubRequestCookie, stubRequestCookies, ExpectedCookie } from './requestTestUtils'
import type { BodyScanServices } from '../../bodyscan/services'
import { HmppsUser } from '../../interfaces/hmppsUser'
import refreshSystemToken from '../../middleware/refreshSystemToken'

export const user = {
  firstName: 'first',
  lastName: 'last',
  userId: 'id',
  token: 'token',
  username: 'user1',
  displayName: 'First Last',
  activeCaseLoadId: 'MDI',
  authSource: 'NOMIS',
}

const signedCookiesProvider = jest.fn()

export const stubCookie = <T>(state: StateOperations<T>, value: T) =>
  stubRequestCookie(signedCookiesProvider, state, value)

export const stubCookies = (cookies: ExpectedCookie<unknown>[]) => stubRequestCookies(signedCookiesProvider, cookies)

export const flashProvider = jest.fn()

function appSetup(
  services: Services,
  bodyScanServices: BodyScanServices,
  production: boolean,
  userSupplier: () => Express.User,
  roles: Role[],
): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, path)
  app.use(cookieParser(config.session.secret))
  app.use(cookieSession({ keys: [''] }))
  app.use((req, res, next) => {
    req.user = userSupplier()
    req.flash = flashProvider
    req.signedCookies = signedCookiesProvider()
    res.locals = {
      user: { ...req.user } as HmppsUser,
    }
    next()
  })
  app.use(express.json())
  app.use(refreshSystemToken(services))
  app.use(express.urlencoded({ extended: true }))
  app.use(wpipRoutes(services))
  app.use(bodyScanRoutes(bodyScanServices))
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(production))

  return app
}

export function appWithAllRoutes({
  production = false,
  services = {},
  bodyScanServices = {},
  userSupplier = () => user,
  roles = [] as Role[],
}: {
  production?: boolean
  services?: Partial<Services>
  bodyScanServices?: Partial<BodyScanServices>
  userSupplier?: () => Express.User
  roles?: Role[]
  signedCookies?: () => Record<string, Record<string, string>>
}): Express {
  auth.default.authenticationMiddleware = () => (req, res, next) => next()
  return appSetup(services as Services, bodyScanServices as BodyScanServices, production, userSupplier, roles)
}
