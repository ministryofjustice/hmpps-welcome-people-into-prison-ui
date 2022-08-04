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

import { State } from '../state'
import type { Services } from '../../../../services'
import Role from '../../../../authentication/role'
import redirectIfDisabledMiddleware from '../../../../middleware/redirectIfDisabledMiddleware'
import config from '../../../../config'
import Routes from '../../../../utils/routeBuilder'

export default function routes(services: Services): Router {
  const checkNewArrivalPresent = State.newArrival.ensurePresent('/page-not-found')

  const sexController = new SexController()

  const imprisonmentStatusesController = new ImprisonmentStatusesController(services.imprisonmentStatusesService)

  const movementReasonsController = new MovementReasonsController(services.imprisonmentStatusesService)

  const checkAnswersController = new CheckAnswersController(
    services.expectedArrivalsService,
    services.imprisonmentStatusesService
  )

  const confirmAddedToRollController = new ConfirmAddedToRollController(services.prisonService)

  return Routes.forRole(Role.PRISON_RECEPTION)
    .get('/prisoners/:id/sex', sexController.view())
    .post('/prisoners/:id/sex', validationMiddleware(sexValidation), sexController.assignSex())
    .get('/prisoners/:id/imprisonment-status', imprisonmentStatusesController.view())
    .post(
      '/prisoners/:id/imprisonment-status',
      validationMiddleware(imprisonmentStatusesValidation),
      imprisonmentStatusesController.assignStatus()
    )
    .get(
      '/prisoners/:id/imprisonment-status/:imprisonmentStatus',
      checkNewArrivalPresent,
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
      checkAnswersController.view()
    )
    .post(
      '/prisoners/:id/check-answers',
      checkNewArrivalPresent,
      redirectIfDisabledMiddleware(config.confirmEnabled),
      checkAnswersController.addToRoll()
    )
    .get('/prisoners/:id/confirmation', confirmAddedToRollController.view())
    .build()
}
