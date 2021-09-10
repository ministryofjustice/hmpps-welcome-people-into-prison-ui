import express, { Router, Express } from 'express'
import cookieSession from 'cookie-session'
import createError from 'http-errors'
import path from 'path'

import allRoutes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import * as auth from '../../authentication/auth'
import IncomingMovementsService from '../../services/incomingMovementsService'

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

function appSetup(route: Router, production: boolean, userSupplier: () => Express.User): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, path)

  app.use((req, res, next) => {
    req.user = userSupplier()
    res.locals = {}
    res.locals.user = req.user
    next()
  })

  app.use(cookieSession({ keys: [''] }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/', route)
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(production))

  return app
}

export function appWithAllRoutes({
  production = false,
  incomingMovementsService,
  userSupplier = () => user,
}: {
  production?: boolean
  incomingMovementsService?: IncomingMovementsService
  userSupplier?: () => Express.User
}): Express {
  auth.default.authenticationMiddleware = () => (req, res, next) => next()
  return appSetup(allRoutes(incomingMovementsService), production, userSupplier)
}
