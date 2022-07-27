import type { Router } from 'express'
import type { Services } from '../../../services'

import ReviewDetailsController from './reviewDetailsController'
import ReviewDetailsChangeNameController from './reviewDetailsChangeNameController'
import ReviewDetailsChangeDateOfBirthController from './reviewDetailsChangeDateOfBirthController'

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

  const reviewDetailsController = new ReviewDetailsController(services.expectedArrivalsService)

  const reviewDetailsChangeNameController = new ReviewDetailsChangeNameController()

  const reviewDetailsChangeDateOfBirthController = new ReviewDetailsChangeDateOfBirthController()

  return Routes.forRole(Role.PRISON_RECEPTION)

    .get('/prisoners/:id/review-per-details/new', reviewDetailsController.newReview())
    .get('/prisoners/:id/review-per-details', reviewDetailsController.showReview())

    .get(
      '/prisoners/:id/review-per-details/change-name',
      checkNewArrivalPresent,
      reviewDetailsChangeNameController.showChangeName()
    )
    .post(
      '/prisoners/:id/review-per-details/change-name',
      checkNewArrivalPresent,
      validationMiddleware(NameValidator),
      reviewDetailsChangeNameController.changeName()
    )

    .get(
      '/prisoners/:id/review-per-details/change-date-of-birth',
      checkNewArrivalPresent,
      reviewDetailsChangeDateOfBirthController.showChangeDateOfBirth()
    )
    .post(
      '/prisoners/:id/review-per-details/change-date-of-birth',
      checkNewArrivalPresent,
      validationMiddleware(DateOfBirthValidator),
      reviewDetailsChangeDateOfBirthController.changeDateOfBirth()
    )

    .use(searchForExistingRecordRoutes(services))
    .use(courtReturnRoutes(services))
    .use(confirmArrivalRoutes(services))
    .use(autoMatchingRecordsRoutes(services))
    .build()
}
