import type { Router } from 'express'
import SingleMatchingRecordFoundController from './singleMatchingRecordFoundController'
import NoMatchingRecordsFoundController from './noMatchingRecordsFoundController'
import MultipleMatchingRecordsFoundController from './multipleMatchingRecordsFoundController'

import type { Services } from '../../../../services'
import Role from '../../../../authentication/role'
import validate from '../../../../middleware/validationMiddleware'

import MatchedRecordSelectionValidation from '../searchforexisting/validation/matchedRecordSelectionValidation'
import Routes from '../../../../utils/routeBuilder'

export default function routes(services: Services): Router {
  const singleMatchController = new SingleMatchingRecordFoundController(services.expectedArrivalsService)
  const noMatchController = new NoMatchingRecordsFoundController(services.expectedArrivalsService)
  const mulitipleMatchController = new MultipleMatchingRecordsFoundController(services.expectedArrivalsService)

  return Routes.forRole(Role.PRISON_RECEPTION)
    .get('/prisoners/:id/record-found', singleMatchController.view())
    .get('/prisoners/:id/no-record-found', noMatchController.view())
    .get('/prisoners/:id/possible-records-found', mulitipleMatchController.view())
    .post(
      '/prisoners/:id/possible-records-found',
      validate(MatchedRecordSelectionValidation),
      mulitipleMatchController.submit()
    )
    .build()
}
