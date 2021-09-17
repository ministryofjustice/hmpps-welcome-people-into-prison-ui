import express, { RequestHandler, Router } from 'express'
import ChoosePrisonerController from './choosePrisonerController'

import asyncMiddleware from '../middleware/asyncMiddleware'
import { Services } from '../services'

export default function routes(services: Services): Router {
  const router = express.Router()
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const choosePrisonerController = new ChoosePrisonerController(services.incomingMovementsService)
  get('/confirm-arrival/choose-prisoner', choosePrisonerController.view())

  get('/', (req, res, next) => {
    res.redirect('/confirm-arrival/choose-prisoner')
  })

  return router
}
