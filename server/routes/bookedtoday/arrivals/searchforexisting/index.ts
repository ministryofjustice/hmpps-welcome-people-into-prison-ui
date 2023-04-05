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
import * as backTrackPrevention from '../../../../middleware/backTrackPreventionMiddleware'

export default function routes(services: Services): Router {
  const checkSearchDetailsPresent = State.searchDetails.ensurePresent('/page-not-found')

  const basePath = `/prisoners/:id/search-for-existing-record`

  const multipleMatchFoundController = new MultipleExistingRecordsFoundController(services.expectedArrivalsService)
  const singleMatchFoundController = new SingleExistingRecordFoundController(services.expectedArrivalsService)
  const noMatchFoundController = new NoExistingRecordsFoundController()
  const checkIsLocked = backTrackPrevention.isLocked(services.lockManager, '/duplicate-booking-prevention')

  return Routes.forRole(Role.PRISON_RECEPTION)
    .get(
      `${basePath}/possible-records-found`,
      checkIsLocked,
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
      checkIsLocked,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      checkSearchDetailsPresent,
      singleMatchFoundController.view()
    )
    .post(
      `${basePath}/record-found`,
      redirectIfDisabledMiddleware(config.confirmNoIdentifiersEnabled),
      checkSearchDetailsPresent,
      singleMatchFoundController.submit()
    )
    .get(`${basePath}/no-record-found`, checkIsLocked, noMatchFoundController.view())
    .post(`${basePath}/no-record-found`, checkSearchDetailsPresent, noMatchFoundController.submit())
    .use(searchRoutes(services))
    .build()
}
