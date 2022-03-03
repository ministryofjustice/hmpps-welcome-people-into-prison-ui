import express, { type Router } from 'express'
import ChoosePrisonerController from './choosePrisonerController'

import type { Services } from '../../services'

import transferRoutes from './transfers'
import arrivalRoutes from './arrivals'
import asyncMiddleware from '../../middleware/asyncMiddleware'

export default function routes(services: Services): Router {
  const router = express.Router()

  const choosePrisonerController = new ChoosePrisonerController(services.expectedArrivalsService)
  router.get('/confirm-arrival/choose-prisoner', [asyncMiddleware(choosePrisonerController.view())])
  router.get('/confirm-arrival/choose-prisoner/:id', [asyncMiddleware(choosePrisonerController.redirectToConfirm())])

  router.use(transferRoutes(services))
  router.use(arrivalRoutes(services))

  return router
}
