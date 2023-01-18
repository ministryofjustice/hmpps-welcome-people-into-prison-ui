import express from 'express'

import path from 'path'

import config from './config'
import wpipRoutes from './routes'
import bodyScanRoutes from './bodyscan/routes'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import setUpCurrentUser from './middleware/setUpCurrentUser'
import phaseNameSetup from './phaseNameSetup'

import setUpWebSession from './middleware/setUpWebSession'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpAuthentication from './middleware/setUpAuthentication'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import authorisationMiddleware from './middleware/authorisationMiddleware'
import type { Services } from './services'
import caseloadCheckMiddleware from './middleware/caseloadCheckMiddleware'
import { BodyScanServices } from './bodyscan/services'

export default function createApp(services: Services, bodyScanServices: BodyScanServices): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(setUpHealthChecks())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app, path)
  phaseNameSetup(app, config.phaseName)
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware())
  app.use(setUpCurrentUser(services))
  app.use(caseloadCheckMiddleware(config.enabledPrisons))
  app.get('/page-not-found', (req, res) => res.render('pages/pageNotFound'))

  if (config.serviceIsUnvailable) {
    app.all('*', (req, res) => {
      res.render('pages/serviceUnavailable.njk')
    })
  }
  app.use(wpipRoutes(services))
  app.use(bodyScanRoutes(bodyScanServices))

  app.use((req, res, next) => next(res.redirect('/page-not-found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
