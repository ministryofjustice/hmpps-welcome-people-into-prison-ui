import express, { RequestHandler, Router } from 'express'
import ChoosePrisonerController from './choosePrisonerController'
import PrisonerController from './prisonerController'
import ConfirmArrivalController from './confirmArrivalController'
import CheckAnswersController from './checkAnswersController'
import ConfirmAddedToRollController from './confirmAddedToRollController'

import asyncMiddleware from '../middleware/asyncMiddleware'
import { Services } from '../services'
import TemporaryAbsencesController from './temporaryAbsencesController'

export default function routes(services: Services): Router {
  const router = express.Router()
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const choosePrisonerController = new ChoosePrisonerController(services.expectedArrivalsService)
  get('/confirm-arrival/choose-prisoner', choosePrisonerController.view())

  get('/', (req, res, next) => {
    res.redirect('/confirm-arrival/choose-prisoner')
  })

  const temporaryAbsencesController = new TemporaryAbsencesController(services.temporaryAbsencesService)
  get('/confirm-arrival/return-from-temporary-absence', temporaryAbsencesController.view())

  const prisonerController = new PrisonerController(services.expectedArrivalsService)
  get('/prisoner/:prisonNumber/image', prisonerController.getImage())

  const confirmArrivalController = new ConfirmArrivalController(services.expectedArrivalsService)
  get('/prisoners/:id/confirm-arrival', confirmArrivalController.confirmArrival())

  const checkAnswersController = new CheckAnswersController(services.expectedArrivalsService)
  get('/prisoners/:id/check-answers', checkAnswersController.view())
  post('/prisoners/:id/check-answers', checkAnswersController.addToRoll())

  const confirmAddedToRollController = new ConfirmAddedToRollController(services.expectedArrivalsService)
  get('/prisoners/:id/confirmation', confirmAddedToRollController.view())

  return router
}
