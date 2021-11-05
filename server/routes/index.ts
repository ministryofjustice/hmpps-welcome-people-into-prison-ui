import express, { RequestHandler, Router } from 'express'
import ChoosePrisonerController from './choosePrisonerController'
import PrisonerController from './prisonerController'
import ConfirmArrivalController from './confirmArrivalController'
import CheckAnswersController from './checkAnswersController'
import ConfirmAddedToRollController from './confirmAddedToRollController'

import authorisationForUrlMiddleware from '../middleware/authorisationForUrlMiddleware'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { Services } from '../services'
import TemporaryAbsencesController from './temporaryAbsencesController'
import Role from '../authentication/role'

export default function routes(services: Services): Router {
  const router = express.Router()
  const get = (path: string, handler: RequestHandler, authorisedRoles?: Role[]) =>
    router.get(path, authorisationForUrlMiddleware(authorisedRoles), asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler, authorisedRoles?: Role[]) =>
    router.post(path, authorisationForUrlMiddleware(authorisedRoles), asyncMiddleware(handler))

  const choosePrisonerController = new ChoosePrisonerController(services.expectedArrivalsService)
  get('/confirm-arrival/choose-prisoner', choosePrisonerController.view())

  get('/', (req, res, next) => {
    res.redirect('/confirm-arrival/choose-prisoner')
  })

  const temporaryAbsencesController = new TemporaryAbsencesController(services.temporaryAbsencesService)
  get('/confirm-arrival/return-from-temporary-absence', temporaryAbsencesController.view(), [Role.PRISON_RECEPTION])

  const prisonerController = new PrisonerController(services.expectedArrivalsService)
  get('/prisoner/:prisonNumber/image', prisonerController.getImage())

  const confirmArrivalController = new ConfirmArrivalController(services.expectedArrivalsService)
  get('/prisoners/:id/confirm-arrival', confirmArrivalController.confirmArrival(), [Role.PRISON_RECEPTION])

  const checkAnswersController = new CheckAnswersController(services.expectedArrivalsService)
  get('/prisoners/:id/check-answers', checkAnswersController.view(), [Role.PRISON_RECEPTION])
  post('/prisoners/:id/check-answers', checkAnswersController.addToRoll(), [Role.PRISON_RECEPTION])

  const confirmAddedToRollController = new ConfirmAddedToRollController(services.expectedArrivalsService)
  get('/prisoners/:id/confirmation', confirmAddedToRollController.view(), [Role.PRISON_RECEPTION])

  return router
}
