import express, { RequestHandler, Router } from 'express'
import ChoosePrisonerController from './choosePrisonerController'
import PrisonerController from './prisonerController'
import ConfirmArrivalController from './confirmArrivalController'
import CheckTransferController from './checkTransferController'
import ConfirmTransferAddedToRollController from './confirmTransferAddedToRollController'
import CheckAnswersController from './checkAnswersController'
import ConfirmAddedToRollController from './confirmAddedToRollController'
import ImprisonmentStatusesController from './imprisonmentStatusesController'
import MovementReasonsController from './movementReasonsController'
import imprisonmentStatusesValidation from '../middleware/validation/imprisonmentStatusesValidation'
import movementReasonsValidation from '../middleware/validation/movementReasonsValidation'
import validationMiddleware from '../middleware/validationMiddleware'
import { ensureImprisonmentStatusPresentMiddleware, ensureSexPresentMiddleware } from './state'

import authorisationForUrlMiddleware from '../middleware/authorisationForUrlMiddleware'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { Services } from '../services'
import TemporaryAbsencesController from './temporaryAbsencesController'
import CheckTemporaryAbsenceController from './checkTemporaryAbsenceController'
import ConfirmTemporaryAbsenceAddedToRollController from './confirmTemporaryAbsenceAddedToRollController'
import Role from '../authentication/role'
import SexController from './sexController'
import sexValidation from '../middleware/validation/sexValidation'
import redirectIfDisabledMiddleware from '../middleware/redirectIfDisabledMiddleware'
import config from '../config'

export default function routes(services: Services): Router {
  const router = express.Router()

  const checkImprisonmentStatusPresent = ensureImprisonmentStatusPresentMiddleware('/confirm-arrival/choose-prisoner')
  const checkSexPresent = ensureSexPresentMiddleware('/confirm-arrival/choose-prisoner')

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

  get('/', [
    (req, res, next) => {
      res.render('home.njk')
    },
  ])

  const choosePrisonerController = new ChoosePrisonerController(services.expectedArrivalsService)
  get('/confirm-arrival/choose-prisoner', [choosePrisonerController.view()])

  const prisonerController = new PrisonerController(services.expectedArrivalsService)
  get('/prisoner/:prisonNumber/image', [prisonerController.getImage()])

  const confirmArrivalController = new ConfirmArrivalController(services.expectedArrivalsService)
  get('/prisoners/:id/confirm-arrival', [confirmArrivalController.confirmArrival()], [Role.PRISON_RECEPTION])

  const checkTransferController = new CheckTransferController(services.transfersService)
  get(
    '/prisoners/:prisonNumber/check-transfer',
    [redirectIfDisabledMiddleware(config.confirmEnabled), checkTransferController.checkTransfer()],
    [Role.PRISON_RECEPTION]
  )
  post(
    '/prisoners/:prisonNumber/check-transfer',
    [redirectIfDisabledMiddleware(config.confirmEnabled), checkTransferController.addToRoll()],
    [Role.PRISON_RECEPTION]
  )

  const confirmTransferAddedToRollController = new ConfirmTransferAddedToRollController(services.prisonService)
  get(
    '/prisoners/:prisonNumber/confirm-transfer',
    [confirmTransferAddedToRollController.view()],
    [Role.PRISON_RECEPTION]
  )

  const sexController = new SexController(services.expectedArrivalsService)
  get('/prisoners/:id/sex', [sexController.view()], [Role.PRISON_RECEPTION])
  post('/prisoners/:id/sex', [validationMiddleware(sexValidation), sexController.assignSex()], [Role.PRISON_RECEPTION])

  const imprisonmentStatusesController = new ImprisonmentStatusesController(
    services.imprisonmentStatusesService,
    services.expectedArrivalsService
  )
  get('/prisoners/:id/imprisonment-status', [imprisonmentStatusesController.view()])
  post('/prisoners/:id/imprisonment-status', [
    validationMiddleware(imprisonmentStatusesValidation),
    imprisonmentStatusesController.assignStatus(),
  ])

  const movementReasonsController = new MovementReasonsController(
    services.imprisonmentStatusesService,
    services.expectedArrivalsService
  )
  get('/prisoners/:id/imprisonment-status/:imprisonmentStatus', [movementReasonsController.view()])
  post('/prisoners/:id/imprisonment-status/:imprisonmentStatus', [
    validationMiddleware(movementReasonsValidation(services.imprisonmentStatusesService)),
    movementReasonsController.assignReason(),
  ])

  const checkAnswersController = new CheckAnswersController(
    services.expectedArrivalsService,
    services.imprisonmentStatusesService
  )
  get(
    '/prisoners/:id/check-answers',
    [
      checkSexPresent,
      checkImprisonmentStatusPresent,
      redirectIfDisabledMiddleware(config.confirmEnabled),
      checkAnswersController.view(),
    ],
    [Role.PRISON_RECEPTION]
  )
  post(
    '/prisoners/:id/check-answers',
    [
      checkSexPresent,
      checkImprisonmentStatusPresent,
      redirectIfDisabledMiddleware(config.confirmEnabled),
      checkAnswersController.addToRoll(),
    ],
    [Role.PRISON_RECEPTION]
  )

  const confirmAddedToRollController = new ConfirmAddedToRollController(
    services.expectedArrivalsService,
    services.prisonService
  )
  get('/prisoners/:id/confirmation', [confirmAddedToRollController.view()], [Role.PRISON_RECEPTION])

  get('/feature-not-available', [(req, res) => res.render('pages/featureNotAvailable')], [])

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

  const confirmTemporaryAbsenceAddedToRollController = new ConfirmTemporaryAbsenceAddedToRollController()
  get(
    '/prisoners/:prisonNumber/prisoner-returned',
    [confirmTemporaryAbsenceAddedToRollController.view()],
    [Role.PRISON_RECEPTION]
  )
  return router
}
