import type { Router } from 'express'
import type { Services } from '../../services'

import ChoosePrisonerController from './choosePrisonerController'
import transferRoutes from './transfers'
import arrivalRoutes from './arrivals'
import unexpectedArrivalsRoutes from './unexpectedArrivals'
import Routes from '../../utils/routeBuilder'

export default function routes(services: Services): Router {
  const choosePrisonerController = new ChoosePrisonerController(services.expectedArrivalsService)

  return Routes.forAnyRole()
    .get('/confirm-arrival/choose-prisoner', choosePrisonerController.view())
    .get('/confirm-arrival/choose-prisoner/:id', choosePrisonerController.redirectToConfirm())

    .use(transferRoutes(services))
    .use(arrivalRoutes(services))
    .use(unexpectedArrivalsRoutes(services))
    .build()
}
