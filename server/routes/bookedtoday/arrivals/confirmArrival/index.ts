import express, { RequestHandler, Router } from 'express'

import SexController from './sexController'
import ImprisonmentStatusesController from './imprisonmentStatusesController'
import MovementReasonsController from './movementReasonsController'
import CheckAnswersController from './checkAnswersController'
import ConfirmAddedToRollController from './confirmAddedToRollController'

import imprisonmentStatusesValidation from '../../../../middleware/validation/imprisonmentStatusesValidation'
import movementReasonsValidation from '../../../../middleware/validation/movementReasonsValidation'
import sexValidation from '../../../../middleware/validation/sexValidation'
import validationMiddleware from '../../../../middleware/validationMiddleware'

import { State } from '../state'
import authorisationForUrlMiddleware from '../../../../middleware/authorisationForUrlMiddleware'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'
import type { Services } from '../../../../services'
import Role from '../../../../authentication/role'
import redirectIfDisabledMiddleware from '../../../../middleware/redirectIfDisabledMiddleware'
import config from '../../../../config'

export default function routes(services: Services): Router {
  const router = express.Router()

  const checkNewArrivalPresent = State.newArrival.ensurePresent('/')

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

  const sexController = new SexController()
  get('/prisoners/:id/sex', [sexController.view()], [Role.PRISON_RECEPTION])
  post('/prisoners/:id/sex', [validationMiddleware(sexValidation), sexController.assignSex()], [Role.PRISON_RECEPTION])

  const imprisonmentStatusesController = new ImprisonmentStatusesController(services.imprisonmentStatusesService)
  get('/prisoners/:id/imprisonment-status', [imprisonmentStatusesController.view()])
  post('/prisoners/:id/imprisonment-status', [
    validationMiddleware(imprisonmentStatusesValidation),
    imprisonmentStatusesController.assignStatus(),
  ])

  const movementReasonsController = new MovementReasonsController(services.imprisonmentStatusesService)
  get('/prisoners/:id/imprisonment-status/:imprisonmentStatus', [
    checkNewArrivalPresent,
    movementReasonsController.view(),
  ])
  post('/prisoners/:id/imprisonment-status/:imprisonmentStatus', [
    validationMiddleware(movementReasonsValidation(services.imprisonmentStatusesService)),
    movementReasonsController.assignReason(),
  ])

  const checkAnswersController = new CheckAnswersController(
    services.expectedArrivalsService,
    services.imprisonmentStatusesService,
    services.raiseAnalyticsEvent
  )
  get(
    '/prisoners/:id/check-answers',
    [checkNewArrivalPresent, redirectIfDisabledMiddleware(config.confirmEnabled), checkAnswersController.view()],
    [Role.PRISON_RECEPTION]
  )
  post(
    '/prisoners/:id/check-answers',
    [checkNewArrivalPresent, redirectIfDisabledMiddleware(config.confirmEnabled), checkAnswersController.addToRoll()],
    [Role.PRISON_RECEPTION]
  )

  const confirmAddedToRollController = new ConfirmAddedToRollController(services.prisonService)
  get('/prisoners/:id/confirmation', [confirmAddedToRollController.view()], [Role.PRISON_RECEPTION])

  return router
}
