import type { Router } from 'express'
import MultipleExistingRecordsFoundController from './multipleExistingRecordsFoundController'
import SingleExistingRecordFoundController from './singleExistingRecordFoundController'
import NoExistingRecordsFoundController from './noExistingRecordsFoundController'

import validationMiddleware from '../../../../middleware/validationMiddleware'
import MatchedRecordSelectionValidation from './validation/matchedRecordSelectionValidation'

import type { Services } from '../../../../services'
import Role from '../../../../authentication/role'
import redirectIfDisabledMiddleware from '../../../../middleware/redirectIfDisabledMiddleware'
import config from '../../../../config'
import { State } from '../state'
import searchRoutes from './search'
import Routes from '../../../../utils/routeBuilder'

export default function routes(services: Services): Router {
  const checkSearchDetailsPresent = State.searchDetails.ensurePresent('/page-not-found')
  const checkNewArrivalPresent = State.newArrival.ensurePresent('/page-not-found')

  const basePath = `/prisoners/:id/search-for-existing-record`

  const multipleMatchFoundController = new MultipleExistingRecordsFoundController(services.expectedArrivalsService)
  const singleMatchFoundController = new SingleExistingRecordFoundController()
  const noMatchFoundController = new NoExistingRecordsFoundController()

  return Routes.forRole(Role.PRISON_RECEPTION)
    .get(
      `${basePath}/possible-records-found`,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      checkSearchDetailsPresent,
      multipleMatchFoundController.view()
    )
    .post(
      `${basePath}/possible-records-found`,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      checkSearchDetailsPresent,
      validationMiddleware(MatchedRecordSelectionValidation),
      multipleMatchFoundController.submit()
    )
    .get(
      `${basePath}/record-found`,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      checkNewArrivalPresent,
      checkSearchDetailsPresent,
      singleMatchFoundController.view()
    )
    .get(`${basePath}/no-record-found`, noMatchFoundController.view())
    .use(searchRoutes(services))
    .build()
}
