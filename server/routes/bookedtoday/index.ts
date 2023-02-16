import type { Router } from 'express'
import type { Services } from '../../services'

import ChoosePrisonerController from './choosePrisonerController'
import transferRoutes from './transfers'
import arrivalRoutes from './arrivals'
import unexpectedArrivalsRoutes from './unexpectedArrivals'
import Routes from '../../utils/routeBuilder'
import SummaryWithRecordController from './summaryWithRecordController'
import SummaryMoveOnlyController from './summaryMoveOnlyController'

export default function routes(services: Services): Router {
  const choosePrisonerController = new ChoosePrisonerController(services.expectedArrivalsService)
  const summaryWithRecordController = new SummaryWithRecordController(services.expectedArrivalsService)
  const summaryMoveOnlyController = new SummaryMoveOnlyController(services.expectedArrivalsService)

  return Routes.forAnyRole()
    .get('/confirm-arrival/choose-prisoner', choosePrisonerController.view())
    .get('/confirm-arrival/choose-prisoner/:id', choosePrisonerController.redirectToConfirm())

    .get('/prisoners/:id/summary-with-record', summaryWithRecordController.view())
    .get('/prisoners/:id/summary-move-only', summaryMoveOnlyController.view())

    .use(transferRoutes(services))
    .use(arrivalRoutes(services))
    .use(unexpectedArrivalsRoutes(services))

    .build()
}
