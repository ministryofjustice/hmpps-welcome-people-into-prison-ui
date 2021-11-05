import express, { RequestHandler, Router } from 'express'
import ChoosePrisonerController from './choosePrisonerController'
import PrisonerController from './prisonerController'
import ConfirmArrivalController from './confirmArrivalController'
import CheckAnswersController from './checkAnswersController'
import ConfirmAddedToRollController from './confirmAddedToRollController'
import ImprisonmentStatusesController from './imprisonmentStatusesController'
import ImprisonmentReasonsController from './imprisonmentReasonsController'
import imprisonmentStatusesValidation from '../middleware/validation/imprisonmentStatusesValidation'
import imprisonmentReasonsValidation from '../middleware/validation/imprisonmentReasonsValidation'
import checkAnswersValidation from '../middleware/validation/checkAnswersValidation'

import authorisationForUrlMiddleware from '../middleware/authorisationForUrlMiddleware'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { Services } from '../services'
import TemporaryAbsencesController from './temporaryAbsencesController'
import Role from '../authentication/role'

export default function routes(services: Services): Router {
  const router = express.Router()
  const get = (path: string, handler: RequestHandler, authorisedRoles?: Role[]) =>
    router.get(path, authorisationForUrlMiddleware(authorisedRoles), asyncMiddleware(handler))
  const post = (path: string, validation: RequestHandler, handler: RequestHandler, authorisedRoles?: Role[]) =>
    router.post(path, validation, authorisationForUrlMiddleware(authorisedRoles), asyncMiddleware(handler))
  // const post = (path: string, validation: RequestHandler, handler: RequestHandler) =>
  //   router.post(path, validation, asyncMiddleware(handler))

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
  post(
    '/prisoners/:id/imprisonment-status',
    imprisonmentStatusesValidation,
    imprisonmentStatusesController.assignStatus()
  )

  const imprisonmentReasonsController = new ImprisonmentReasonsController(
    services.imprisonmentStatusesService,
    services.expectedArrivalsService
  )
  get('/prisoners/:id/imprisonment-status/:imprisonmentStatus', imprisonmentReasonsController.view())
  post(
    '/prisoners/:id/imprisonment-status/:imprisonmentStatus',
    imprisonmentReasonsValidation,
    imprisonmentReasonsController.assignReason()
  )

  const checkAnswersController = new CheckAnswersController(services.expectedArrivalsService)
  get('/prisoners/:id/check-answers', checkAnswersController.view(), [Role.PRISON_RECEPTION])
  post('/prisoners/:id/check-answers', checkAnswersController.addToRoll(), checkAnswersValidation, [
    Role.PRISON_RECEPTION,
  ])

  const confirmAddedToRollController = new ConfirmAddedToRollController(services.expectedArrivalsService)
  get('/prisoners/:id/confirmation', confirmAddedToRollController.view(), [Role.PRISON_RECEPTION])

  return router
}
