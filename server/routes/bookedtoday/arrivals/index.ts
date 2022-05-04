import type { Router } from 'express'
import type { Services } from '../../../services'

import ReviewPerDetailsController from './reviewPerDetailsController'
import ReviewPerDetailsChangeNameController from './reviewPerDetailsChangeNameController'
import ReviewPerDetailsChangeDateOfBirthController from './reviewPerDetailsChangeDateOfBirthController'

import searchForExistingRecordRoutes from './searchforexisting'
import courtReturnRoutes from './courtreturns'
import confirmArrivalRoutes from './confirmArrival'
import autoMatchingRecordsRoutes from './autoMatchingRecords'

import NameValidator from './validation/nameValidation'
import DateOfBirthValidator from './validation/dateOfBirthValidation'
import validationMiddleware from '../../../middleware/validationMiddleware'

import { State } from './state'
import Role from '../../../authentication/role'
import Routes from '../../../utils/routeBuilder'

export default function routes(services: Services): Router {
  const checkNewArrivalPresent = State.newArrival.ensurePresent('/page-not-found')

  const reviewPerDetailsController = new ReviewPerDetailsController(services.expectedArrivalsService)

  const reviewPerDetailsChangeNameController = new ReviewPerDetailsChangeNameController()

  const reviewPerDetailsChangeDateOfBirthController = new ReviewPerDetailsChangeDateOfBirthController()

  return Routes.forRole(Role.PRISON_RECEPTION)

    .get('/prisoners/:id/review-per-details/new', reviewPerDetailsController.newReview())
    .get('/prisoners/:id/review-per-details', reviewPerDetailsController.showReview())

    .get(
      '/prisoners/:id/review-per-details/change-name',
      checkNewArrivalPresent,
      reviewPerDetailsChangeNameController.showChangeName()
    )
    .post(
      '/prisoners/:id/review-per-details/change-name',
      checkNewArrivalPresent,
      validationMiddleware(NameValidator),
      reviewPerDetailsChangeNameController.changeName()
    )

    .get(
      '/prisoners/:id/review-per-details/change-date-of-birth',
      checkNewArrivalPresent,
      reviewPerDetailsChangeDateOfBirthController.showChangeDateOfBirth()
    )
    .post(
      '/prisoners/:id/review-per-details/change-date-of-birth',
      checkNewArrivalPresent,
      validationMiddleware(DateOfBirthValidator),
      reviewPerDetailsChangeDateOfBirthController.changeDateOfBirth()
    )

    .use(searchForExistingRecordRoutes(services))
    .use(courtReturnRoutes(services))
    .use(confirmArrivalRoutes(services))
    .use(autoMatchingRecordsRoutes(services))
    .build()
}
