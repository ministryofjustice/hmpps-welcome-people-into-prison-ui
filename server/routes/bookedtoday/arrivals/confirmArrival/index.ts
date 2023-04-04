import type { Router } from 'express'
import SexController from './sexController'
import ImprisonmentStatusesController from './imprisonmentStatusesController'
import MovementReasonsController from './movementReasonsController'
import CheckAnswersController from './checkAnswersController'
import ConfirmAddedToRollController from './confirmAddedToRollController'

import imprisonmentStatusesValidation from '../../../../middleware/validation/imprisonmentStatusesValidation'
import movementReasonsValidation from '../../../../middleware/validation/movementReasonsValidation'
import sexValidation from '../../../../middleware/validation/sexValidation'
import validationMiddleware from '../../../../middleware/validationMiddleware'
import * as doubleClickPrevention from '../../../../middleware/doubleClickPreventionMiddleware'

import { State } from '../state'
import type { Services } from '../../../../services'
import Role from '../../../../authentication/role'
import redirectIfDisabledMiddleware from '../../../../middleware/redirectIfDisabledMiddleware'
import config from '../../../../config'
import Routes from '../../../../utils/routeBuilder'
import StartConfirmationController from './startConfirmationController'

export default function routes(services: Services): Router {
  const checkNewArrivalPresent = State.newArrival.ensurePresent('/page-not-found')

  const startConfirmationController = new StartConfirmationController(services.expectedArrivalsService)
  const sexController = new SexController()
  const imprisonmentStatusesController = new ImprisonmentStatusesController(services.imprisonmentStatusesService)

  const movementReasonsController = new MovementReasonsController(services.imprisonmentStatusesService)

  const checkAnswersController = new CheckAnswersController(
    services.expectedArrivalsService,
    services.imprisonmentStatusesService
  )

  const setLock = doubleClickPrevention.setLock(services.lockManager, '/confirm-arrival/choose-prisoner')
  const checkIsLocked = doubleClickPrevention.isLocked(services.lockManager, '/duplicate-booking-prevention')

  const confirmAddedToRollController = new ConfirmAddedToRollController(services.prisonService)

  return Routes.forRole(Role.PRISON_RECEPTION)
    .get('/prisoners/:id/start-confirmation', checkIsLocked, startConfirmationController.redirect())
    .get('/prisoners/:id/sex', checkIsLocked, sexController.view())
    .post('/prisoners/:id/sex', validationMiddleware(sexValidation), sexController.assignSex())
    .get('/prisoners/:id/imprisonment-status', checkIsLocked, imprisonmentStatusesController.view())
    .post(
      '/prisoners/:id/imprisonment-status',
      validationMiddleware(imprisonmentStatusesValidation),
      imprisonmentStatusesController.assignStatus()
    )
    .get(
      '/prisoners/:id/imprisonment-status/:imprisonmentStatus',
      checkNewArrivalPresent,
      checkIsLocked,
      movementReasonsController.view()
    )
    .post(
      '/prisoners/:id/imprisonment-status/:imprisonmentStatus',
      validationMiddleware(movementReasonsValidation(services.imprisonmentStatusesService)),
      movementReasonsController.assignReason()
    )
    .get(
      '/prisoners/:id/check-answers',
      checkNewArrivalPresent,
      redirectIfDisabledMiddleware(config.confirmEnabled),
      checkIsLocked,
      checkAnswersController.view()
    )
    .post(
      '/prisoners/:id/check-answers',
      checkNewArrivalPresent,
      redirectIfDisabledMiddleware(config.confirmEnabled),
      setLock,
      checkAnswersController.addToRoll()
    )
    .get('/prisoners/:id/confirmation', confirmAddedToRollController.view())
    .build()
}
