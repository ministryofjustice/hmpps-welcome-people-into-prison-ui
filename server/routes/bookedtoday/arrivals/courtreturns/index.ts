import express, { RequestHandler, Router } from 'express'
import CheckCourtReturnController from './checkCourtReturnController'
import ConfirmCourtReturnController from './confirmCourtReturnController'

import authorisationForUrlMiddleware from '../../../../middleware/authorisationForUrlMiddleware'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'
import { Services } from '../../../../services'
import Role from '../../../../authentication/role'
import redirectIfDisabledMiddleware from '../../../../middleware/redirectIfDisabledMiddleware'
import config from '../../../../config'

export default function routes(services: Services): Router {
  const router = express.Router()

  const get = (path: string, handlers: RequestHandler[], authorisedRoles?: Role[]) =>
    router.get(
      path,
      authorisationForUrlMiddleware(authorisedRoles),
      handlers.map(handler => asyncMiddleware(handler))
    )

  const post = (path: string, handlers: RequestHandler[], authorisedRoles?: Role[]) =>
    router.post(
      path,
      authorisationForUrlMiddleware(authorisedRoles),
      handlers.map(handler => asyncMiddleware(handler))
    )

  const checkCourtReturnController = new CheckCourtReturnController(
    services.expectedArrivalsService,
    services.raiseAnalyticsEvent
  )
  get(
    '/prisoners/:id/check-court-return',
    [redirectIfDisabledMiddleware(config.confirmEnabled), checkCourtReturnController.checkCourtReturn()],
    [Role.PRISON_RECEPTION]
  )
  post(
    '/prisoners/:id/check-court-return',
    [redirectIfDisabledMiddleware(config.confirmEnabled), checkCourtReturnController.addToRoll()],
    [Role.PRISON_RECEPTION]
  )

  const confirmCourtReturnController = new ConfirmCourtReturnController(services.prisonService)
  get(
    '/prisoners/:id/prisoner-returned-from-court',
    [redirectIfDisabledMiddleware(config.confirmEnabled), confirmCourtReturnController.view()],
    [Role.PRISON_RECEPTION]
  )

  return router
}
