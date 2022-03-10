import express, { RequestHandler, Router } from 'express'
import SingleRecordFoundController from './singleRecordFoundController'
import NoRecordFoundController from './noRecordFoundController'
import ReviewPerDetailsController from './reviewPerDetailsController'
import ReviewPerDetailsChangeNameController from './reviewPerDetailsChangeNameController'
import ReviewPerDetailsChangeDateOfBirthController from './reviewPerDetailsChangeDateOfBirthController'

import searchForExistingRecordRoutes from './searchforexisting'
import courtReturnRoutes from './courtreturns'
import matchingRecordsRoutes from './matchingRecords'
import confirmArrivalRoutes from './confirmArrival'

import NameValidator from './validation/nameValidation'
import DateOfBirthValidator from './validation/dateOfBirthValidation'
import validationMiddleware from '../../../middleware/validationMiddleware'

import { State } from './state'
import authorisationForUrlMiddleware from '../../../middleware/authorisationForUrlMiddleware'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import { Services } from '../../../services'
import Role from '../../../authentication/role'

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

  router.use(searchForExistingRecordRoutes(services))
  router.use(courtReturnRoutes(services))
  router.use(matchingRecordsRoutes(services))
  router.use(confirmArrivalRoutes(services))

  return router
}
