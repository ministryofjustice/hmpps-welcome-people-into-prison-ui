import express, { Express } from 'express'
import cookieSession from 'cookie-session'
import createError from 'http-errors'
import path from 'path'

import routes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import * as auth from '../../authentication/auth'
import { Services } from '../../services'

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

function appSetup(
  services: Services,
  production: boolean,
  userSupplier: () => Express.User,
  flash: {
    (): { [key: string]: string[] }
    (message: string): string[]
    (type: string, message: string | string[]): number
    (type: string, format: string, ...args: unknown[]): number
  }
): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, path)

  app.use((req, res, next) => {
    req.user = userSupplier()
    req.flash = flash
    res.locals = {}
    res.locals.user = req.user
    next()
  })

  app.use(cookieSession({ keys: [''] }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(routes(services))
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(production))

  return app
}

export function appWithAllRoutes({
  production = false,
  services = {},
  userSupplier = () => user,
  flash = jest.fn().mockReturnValue([]),
}: {
  production?: boolean
  services?: Partial<Services>
  userSupplier?: () => Express.User
  flash?: {
    (): { [key: string]: string[] }
    (message: string): string[]
    (type: string, message: string | string[]): number
    (type: string, format: string, ...args: unknown[]): number
  }
}): Express {
  auth.default.authenticationMiddleware = () => (req, res, next) => next()
  return appSetup(services as Services, production, userSupplier, flash)
}
