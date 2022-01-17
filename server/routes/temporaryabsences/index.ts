import express, { RequestHandler, Router } from 'express'

import authorisationForUrlMiddleware from '../../middleware/authorisationForUrlMiddleware'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import { Services } from '../../services'
import TemporaryAbsencesController from './temporaryAbsencesController'
import CheckTemporaryAbsenceController from './checkTemporaryAbsenceController'
import ConfirmTemporaryAbsenceAddedToRollController from './confirmTemporaryAbsenceAddedToRollController'
import Role from '../../authentication/role'
import redirectIfDisabledMiddleware from '../../middleware/redirectIfDisabledMiddleware'
import config from '../../config'

export default function routes(services: Services): Router {
  const router = express.Router()

  const get = (path: string, handlers: RequestHandler[], authorisedRoles?: Role[]) =>
    router.get(
      path,
      authorisationForUrlMiddleware(authorisedRoles),
      handlers.map(handler => asyncMiddleware(handler))
    )

  const post = (path: string, handlers: RequestHandler[], authorisedRoles?: Role[]) =>
    router.post(
      path,
      authorisationForUrlMiddleware(authorisedRoles),
      handlers.map(handler => asyncMiddleware(handler))
    )

  const temporaryAbsencesController = new TemporaryAbsencesController(services.temporaryAbsencesService)
  get('/prisoners-returning', [temporaryAbsencesController.view()])

  const checkTemporaryAbsenceController = new CheckTemporaryAbsenceController(services.temporaryAbsencesService)
  get(
    '/prisoners/:prisonNumber/check-temporary-absence',
    [redirectIfDisabledMiddleware(config.confirmEnabled), checkTemporaryAbsenceController.checkTemporaryAbsence()],
    [Role.PRISON_RECEPTION]
  )
  post(
    '/prisoners/:prisonNumber/check-temporary-absence',
    [redirectIfDisabledMiddleware(config.confirmEnabled), checkTemporaryAbsenceController.addToRoll()],
    [Role.PRISON_RECEPTION]
  )

  const confirmTemporaryAbsenceAddedToRollController = new ConfirmTemporaryAbsenceAddedToRollController(
    services.prisonService
  )
  get(
    '/prisoners/:prisonNumber/prisoner-returned',
    [redirectIfDisabledMiddleware(config.confirmEnabled), confirmTemporaryAbsenceAddedToRollController.view()],
    [Role.PRISON_RECEPTION]
  )
  return router
}
