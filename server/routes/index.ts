import express, { RequestHandler, Router } from 'express'
import ChoosePrisonerController from './choosePrisonerController'
import PrisonerController from './prisonerController'
import ConfirmArrivalController from './confirmArrivalController'
import CheckTransferController from './checkTransferController'
import ConfirmTransferAddedToRollController from './confirmTransferAddedToRollController'
import CheckAnswersController from './checkAnswersController'
import ConfirmAddedToRollController from './confirmAddedToRollController'
import ImprisonmentStatusesController from './imprisonmentStatusesController'
import MovementReasonsController from './movementReasonsController'
import imprisonmentStatusesValidation from '../middleware/validation/imprisonmentStatusesValidation'
import movementReasonsValidation from '../middleware/validation/movementReasonsValidation'
import validationMiddleware from '../middleware/validationMiddleware'
import { ensureImprisonmentStatusPresentMiddleware } from './state'

import authorisationForUrlMiddleware from '../middleware/authorisationForUrlMiddleware'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { Services } from '../services'
import TemporaryAbsencesController from './temporaryAbsencesController'
import Role from '../authentication/role'

export default function routes(services: Services): Router {
  const router = express.Router()

  const checkImprisonmentStatusPresent = ensureImprisonmentStatusPresentMiddleware('/confirm-arrival/choose-prisoner')

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

  get('/', [
    (req, res, next) => {
      res.render('home.njk')
    },
  ])

  const choosePrisonerController = new ChoosePrisonerController(services.expectedArrivalsService)
  get('/confirm-arrival/choose-prisoner', [choosePrisonerController.view()])

  const temporaryAbsencesController = new TemporaryAbsencesController(services.temporaryAbsencesService)
  get('/confirm-arrival/return-from-temporary-absence', [temporaryAbsencesController.view()])

  const prisonerController = new PrisonerController(services.expectedArrivalsService)
  get('/prisoner/:prisonNumber/image', [prisonerController.getImage()])

  const confirmArrivalController = new ConfirmArrivalController(services.expectedArrivalsService)
  get('/prisoners/:id/confirm-arrival', [confirmArrivalController.confirmArrival()], [Role.PRISON_RECEPTION])

  const checkTransferController = new CheckTransferController(services.transfersService)
  get('/prisoners/:prisonNumber/check-transfer', [checkTransferController.checkTransfer()], [Role.PRISON_RECEPTION])
  post('/prisoners/:prisonNumber/check-transfer', [checkTransferController.addToRoll()], [Role.PRISON_RECEPTION])

  const confirmTransferAddedToRollController = new ConfirmTransferAddedToRollController(
    services.expectedArrivalsService
  )
  get(
    '/prisoners/:prisonNumber/confirm-transfer',
    [confirmTransferAddedToRollController.view()],
    [Role.PRISON_RECEPTION]
  )

  const imprisonmentStatusesController = new ImprisonmentStatusesController(
    services.imprisonmentStatusesService,
    services.expectedArrivalsService
  )
  get('/prisoners/:id/imprisonment-status', [imprisonmentStatusesController.view()])
  post('/prisoners/:id/imprisonment-status', [
    validationMiddleware(imprisonmentStatusesValidation),
    imprisonmentStatusesController.assignStatus(),
  ])

  const movementReasonsController = new MovementReasonsController(
    services.imprisonmentStatusesService,
    services.expectedArrivalsService
  )
  get('/prisoners/:id/imprisonment-status/:imprisonmentStatus', [movementReasonsController.view()])
  post('/prisoners/:id/imprisonment-status/:imprisonmentStatus', [
    validationMiddleware(movementReasonsValidation(services.imprisonmentStatusesService)),
    movementReasonsController.assignReason(),
  ])

  const checkAnswersController = new CheckAnswersController(
    services.expectedArrivalsService,
    services.imprisonmentStatusesService
  )
  get(
    '/prisoners/:id/check-answers',
    [checkImprisonmentStatusPresent, checkAnswersController.view()],
    [Role.PRISON_RECEPTION]
  )
  post(
    '/prisoners/:id/check-answers',
    [checkImprisonmentStatusPresent, checkAnswersController.addToRoll()],
    [Role.PRISON_RECEPTION]
  )

  const confirmAddedToRollController = new ConfirmAddedToRollController(services.expectedArrivalsService)
  get('/prisoners/:id/confirmation', [confirmAddedToRollController.view()], [Role.PRISON_RECEPTION])

  return router
}
