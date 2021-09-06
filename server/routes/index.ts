import express, { RequestHandler, Router } from 'express'
import ChoosePrisonerController from './choosePrisonerController'
import IncomingMovementsService from '../services/incomingMovementsService'

import asyncMiddleware from '../middleware/asyncMiddleware'

export default function routes(incomingMovementsService: IncomingMovementsService): Router {
  const router = express.Router()
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const choosePrisonerController = new ChoosePrisonerController(incomingMovementsService)
  get('/confirm-arrival/choose-prisoner', choosePrisonerController.view())

  get('/', (req, res, next) => {
    res.redirect('/confirm-arrival/choose-prisoner')
  })

  return router
}
