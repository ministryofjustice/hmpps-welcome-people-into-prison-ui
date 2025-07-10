import { dataAccess } from '../data'
import ExpectedArrivalsService from './expectedArrivalsService'
import TemporaryAbsencesService from './temporaryAbsencesService'
import ImprisonmentStatusesService from './imprisonmentStatusesService'
import TransfersService from './transfersService'
import PrisonService from './prisonService'
import NotificationService from './notificationService'
import { raiseAnalyticsEvent, type RaiseAnalyticsEvent } from './raiseAnalyticsEvent'
import { BodyScanInfoDecorator } from './bodyScanInfoDecorator'
import { MatchTypeDecorator } from './matchTypeDecorator'
import OffenceInfoDecorator from './offenceInfoDecorator'
import FeComponentsService from './feComponentsService'
import ManageUsersService from './manageUsersService'
import AuthService from './authService'

export const services = () => {
  const {
    applicationInfo,
    hmppsAuthClient,
    welcomeClientBuilder,
    prisonRegisterClientBuilder,
    feComponentsClient,
    bodyScanClientBuilder,
    notifyClient,
    lockManager,
    manageUsersApiClient,
  } = dataAccess()

  const bodyScanInfoDecorator = new BodyScanInfoDecorator(bodyScanClientBuilder)
  const feComponentsService = new FeComponentsService(feComponentsClient)
  const matchTypeDecorator = new MatchTypeDecorator()
  const offenceInfoDecorator = new OffenceInfoDecorator()

  const manageUsersService = new ManageUsersService(manageUsersApiClient)
  const authService = new AuthService(hmppsAuthClient)
  const notificationService = new NotificationService(notifyClient)
  const expectedArrivalsService = new ExpectedArrivalsService(
    welcomeClientBuilder,
    raiseAnalyticsEvent,
    bodyScanInfoDecorator,
    matchTypeDecorator,
    offenceInfoDecorator,
  )
  const temporaryAbsencesService = new TemporaryAbsencesService(welcomeClientBuilder, bodyScanInfoDecorator)
  const imprisonmentStatusesService = new ImprisonmentStatusesService(welcomeClientBuilder)
  const transfersService = new TransfersService(welcomeClientBuilder, bodyScanInfoDecorator)
  const prisonService = new PrisonService(prisonRegisterClientBuilder)

  return {
    applicationInfo,
    hmppsAuthClient,
    authService,
    manageUsersService,
    feComponentsService,
    notificationService,
    expectedArrivalsService,
    temporaryAbsencesService,
    imprisonmentStatusesService,
    transfersService,
    prisonService,
    raiseAnalyticsEvent,
    lockManager,
  }
}

export type Services = ReturnType<typeof services>

export {
  BodyScanInfoDecorator,
  MatchTypeDecorator,
  NotificationService,
  ExpectedArrivalsService,
  TemporaryAbsencesService,
  ImprisonmentStatusesService,
  TransfersService,
  PrisonService,
  RaiseAnalyticsEvent,
  OffenceInfoDecorator,
}
