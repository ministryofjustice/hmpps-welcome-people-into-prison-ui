import express, { RequestHandler, Router } from 'express'
import SingleRecordFoundController from './singleRecordFoundController'
import NoRecordFoundController from './noRecordFoundController'
import ReviewPerDetailsController from './reviewPerDetailsController'
import ReviewPerDetailsChangeNameController from './reviewPerDetailsChangeNameController'
import ReviewPerDetailsChangeDateOfBirthController from './reviewPerDetailsChangeDateOfBirthController'
import CheckAnswersController from './checkAnswersController'
import ConfirmAddedToRollController from './confirmAddedToRollController'
import ImprisonmentStatusesController from './imprisonmentStatusesController'
import MovementReasonsController from './movementReasonsController'
import searchForExistingRecordRoutes from './searchforexisting'
import courtReturnRoutes from './courtreturns'
import matchingRecordsRoutes from './matchingRecords'

import imprisonmentStatusesValidation from '../../../middleware/validation/imprisonmentStatusesValidation'
import movementReasonsValidation from '../../../middleware/validation/movementReasonsValidation'
import NameValidator from './validation/nameValidation'
import DateOfBirthValidator from './validation/dateOfBirthValidation'
import validationMiddleware from '../../../middleware/validationMiddleware'
import { State } from './state'

import authorisationForUrlMiddleware from '../../../middleware/authorisationForUrlMiddleware'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import { Services } from '../../../services'
import Role from '../../../authentication/role'
import SexController from './sexController'
import sexValidation from '../../../middleware/validation/sexValidation'
import redirectIfDisabledMiddleware from '../../../middleware/redirectIfDisabledMiddleware'
import config from '../../../config'

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

  const singleRecordFoundController = new SingleRecordFoundController(services.expectedArrivalsService)
  get('/prisoners/:id/record-found', [singleRecordFoundController.view()], [Role.PRISON_RECEPTION])

  const noRecordFoundController = new NoRecordFoundController(services.expectedArrivalsService)
  get('/prisoners/:id/no-record-found', [noRecordFoundController.view()], [Role.PRISON_RECEPTION])

  const reviewPerDetailsController = new ReviewPerDetailsController(services.expectedArrivalsService)
  get('/prisoners/:id/review-per-details/new', [reviewPerDetailsController.newReview()], [Role.PRISON_RECEPTION])
  get('/prisoners/:id/review-per-details', [reviewPerDetailsController.showReview()], [Role.PRISON_RECEPTION])

  const reviewPerDetailsChangeNameController = new ReviewPerDetailsChangeNameController()
  get(
    '/prisoners/:id/review-per-details/change-name',
    [checkNewArrivalPresent, reviewPerDetailsChangeNameController.showChangeName()],
    [Role.PRISON_RECEPTION]
  )
  post(
    '/prisoners/:id/review-per-details/change-name',
    [checkNewArrivalPresent, validationMiddleware(NameValidator), reviewPerDetailsChangeNameController.changeName()],
    [Role.PRISON_RECEPTION]
  )

  const reviewPerDetailsChangeDateOfBirthController = new ReviewPerDetailsChangeDateOfBirthController()
  get(
    '/prisoners/:id/review-per-details/change-date-of-birth',
    [checkNewArrivalPresent, reviewPerDetailsChangeDateOfBirthController.showChangeDateOfBirth()],
    [Role.PRISON_RECEPTION]
  )
  post(
    '/prisoners/:id/review-per-details/change-date-of-birth',
    [
      checkNewArrivalPresent,
      validationMiddleware(DateOfBirthValidator),
      reviewPerDetailsChangeDateOfBirthController.changeDateOfBirth(),
    ],
    [Role.PRISON_RECEPTION]
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

  router.use(searchForExistingRecordRoutes(services))
  router.use(courtReturnRoutes(services))
  router.use(matchingRecordsRoutes(services))

  return router
}
