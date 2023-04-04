import type { Router } from 'express'
import type { Services } from '../../services'

import ChoosePrisonerController from './choosePrisonerController'
import SummaryController from './summaryController'

import transferRoutes from './transfers'
import arrivalRoutes from './arrivals'
import unexpectedArrivalsRoutes from './unexpectedArrivals'
import Routes from '../../utils/routeBuilder'
import SummaryWithRecordController from './summaryWithRecordController'
import SummaryMoveOnlyController from './summaryMoveOnlyController'
import * as doubleClickPrevention from '../../middleware/doubleClickPreventionMiddleware'

export default function routes(services: Services): Router {
  const choosePrisonerController = new ChoosePrisonerController(services.expectedArrivalsService)
  const summaryWithRecordController = new SummaryWithRecordController(services.expectedArrivalsService)
  const summaryMoveOnlyController = new SummaryMoveOnlyController(services.expectedArrivalsService)
  const summaryController = new SummaryController(services.expectedArrivalsService)
  const isLocked = doubleClickPrevention.isLocked(services.lockManager, '/duplicate-booking-prevention')

  return Routes.forAnyRole()
    .get('/confirm-arrival/choose-prisoner/:id/summary', isLocked, summaryController.redirectToSummary())
    .get('/confirm-arrival/choose-prisoner', choosePrisonerController.view())
    .get('/confirm-arrival/choose-prisoner/:id', isLocked, choosePrisonerController.redirectToConfirm())

    .get('/prisoners/:id/summary-with-record', isLocked, summaryWithRecordController.view())
    .get('/prisoners/:id/summary-move-only', isLocked, summaryMoveOnlyController.view())

    .use(transferRoutes(services))
    .use(arrivalRoutes(services))
    .use(unexpectedArrivalsRoutes(services))

    .build()
}
