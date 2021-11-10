import express, { RequestHandler, Router } from 'express'
import ChoosePrisonerController from './choosePrisonerController'
import PrisonerController from './prisonerController'
import ConfirmArrivalController from './confirmArrivalController'
import CheckAnswersController from './checkAnswersController'
import ConfirmAddedToRollController from './confirmAddedToRollController'
import ImprisonmentStatusesController from './imprisonmentStatusesController'
import MovementReasonsController from './movementReasonsController'
import imprisonmentStatusesValidation from '../middleware/validation/imprisonmentStatusesValidation'
import movementReasonsValidation from '../middleware/validation/movementReasonsValidation'

import authorisationForUrlMiddleware from '../middleware/authorisationForUrlMiddleware'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { Services } from '../services'
import TemporaryAbsencesController from './temporaryAbsencesController'
import Role from '../authentication/role'

export default function routes(services: Services): Router {
  const router = express.Router()

  const get = (path: string, handler: RequestHandler, authorisedRoles?: Role[]) =>
    router.get(path, authorisationForUrlMiddleware(authorisedRoles), asyncMiddleware(handler))

  const post = (path: string, handlers: RequestHandler[], authorisedRoles?: Role[]) =>
    router.post(
      path,
      authorisationForUrlMiddleware(authorisedRoles),
      handlers.map(handler => asyncMiddleware(handler))
    )

  const choosePrisonerController = new ChoosePrisonerController(services.expectedArrivalsService)
  get('/confirm-arrival/choose-prisoner', choosePrisonerController.view())

  get('/', (req, res, next) => {
    res.redirect('/confirm-arrival/choose-prisoner')
  })

  const temporaryAbsencesController = new TemporaryAbsencesController(services.temporaryAbsencesService)
  get('/confirm-arrival/return-from-temporary-absence', temporaryAbsencesController.view())

  const prisonerController = new PrisonerController(services.expectedArrivalsService)
  get('/prisoner/:prisonNumber/image', prisonerController.getImage())

  const confirmArrivalController = new ConfirmArrivalController(services.expectedArrivalsService)
  get('/prisoners/:id/confirm-arrival', confirmArrivalController.confirmArrival(), [Role.PRISON_RECEPTION])

  const imprisonmentStatusesController = new ImprisonmentStatusesController(
    services.imprisonmentStatusesService,
    services.expectedArrivalsService
  )
  get('/prisoners/:id/imprisonment-status', imprisonmentStatusesController.view())
  post('/prisoners/:id/imprisonment-status', [
    imprisonmentStatusesValidation,
    imprisonmentStatusesController.assignStatus(),
  ])

  const movementReasonsController = new MovementReasonsController(
    services.imprisonmentStatusesService,
    services.expectedArrivalsService
  )
  get('/prisoners/:id/imprisonment-status/:imprisonmentStatus', movementReasonsController.view())
  post('/prisoners/:id/imprisonment-status/:imprisonmentStatus', [
    movementReasonsValidation(services.imprisonmentStatusesService),
    movementReasonsController.assignReason(),
  ])

  const checkAnswersController = new CheckAnswersController(services.expectedArrivalsService)
  get('/prisoners/:id/check-answers', checkAnswersController.view(), [Role.PRISON_RECEPTION])
  post('/prisoners/:id/check-answers', [checkAnswersController.addToRoll()], [Role.PRISON_RECEPTION])

  const confirmAddedToRollController = new ConfirmAddedToRollController(services.expectedArrivalsService)
  get('/prisoners/:id/confirmation', confirmAddedToRollController.view(), [Role.PRISON_RECEPTION])

  return router
}
