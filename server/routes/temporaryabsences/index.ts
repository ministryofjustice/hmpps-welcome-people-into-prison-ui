import { Router } from 'express'

import { Services } from '../../services'
import TemporaryAbsencesController from './temporaryAbsencesController'
import CheckTemporaryAbsenceController from './checkTemporaryAbsenceController'
import ConfirmTemporaryAbsenceAddedToRollController from './confirmTemporaryAbsenceAddedToRollController'
import Role from '../../authentication/role'
import redirectIfDisabledMiddleware from '../../middleware/redirectIfDisabledMiddleware'
import config from '../../config'
import Routes from '../../utils/routeBuilder'

export default function routes(services: Services): Router {
  const temporaryAbsences = new TemporaryAbsencesController(services.temporaryAbsencesService)

  const checkTemporaryAbsence = new CheckTemporaryAbsenceController(
    services.temporaryAbsencesService,
    services.raiseAnalyticsEvent
  )

  const confirmTemporaryAbsenceAddedToRoll = new ConfirmTemporaryAbsenceAddedToRollController(services.prisonService)

  return Routes.forAnyRole()
    .get('/prisoners-returning', temporaryAbsences.view())

    .forRole(Role.PRISON_RECEPTION)
    .get(
      '/prisoners/:prisonNumber/check-temporary-absence',
      redirectIfDisabledMiddleware(config.confirmEnabled),
      checkTemporaryAbsence.checkTemporaryAbsence()
    )
    .post(
      '/prisoners/:prisonNumber/check-temporary-absence',
      redirectIfDisabledMiddleware(config.confirmEnabled),
      checkTemporaryAbsence.addToRoll()
    )
    .get(
      '/prisoners/:prisonNumber/prisoner-returned',
      redirectIfDisabledMiddleware(config.confirmEnabled),
      confirmTemporaryAbsenceAddedToRoll.view()
    )
    .build()
}
