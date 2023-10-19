import { dataAccess } from '../data'
import UserService from './userService'
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

export const services = () => {
  const {
    hmppsAuthClient,
    welcomeClientBuilder,
    bodyScanClientBuilder,
    feComponentsClientBuilder,
    notifyClient,
    lockManager,
  } = dataAccess()

  const bodyScanInfoDecorator = new BodyScanInfoDecorator(hmppsAuthClient, bodyScanClientBuilder)
  const matchTypeDecorator = new MatchTypeDecorator()
  const offenceInfoDecorator = new OffenceInfoDecorator()

  const userService = new UserService(hmppsAuthClient, welcomeClientBuilder)
  const notificationService = new NotificationService(notifyClient)
  const expectedArrivalsService = new ExpectedArrivalsService(
    hmppsAuthClient,
    welcomeClientBuilder,
    raiseAnalyticsEvent,
    bodyScanInfoDecorator,
    matchTypeDecorator,
    offenceInfoDecorator
  )
  const temporaryAbsencesService = new TemporaryAbsencesService(
    hmppsAuthClient,
    welcomeClientBuilder,
    bodyScanInfoDecorator
  )
  const imprisonmentStatusesService = new ImprisonmentStatusesService(hmppsAuthClient, welcomeClientBuilder)
  const transfersService = new TransfersService(hmppsAuthClient, welcomeClientBuilder, bodyScanInfoDecorator)
  const prisonService = new PrisonService(hmppsAuthClient, welcomeClientBuilder)
  const feComponentsService = new FeComponentsService(feComponentsClientBuilder)

  return {
    hmppsAuthClient,
    userService,
    notificationService,
    expectedArrivalsService,
    temporaryAbsencesService,
    imprisonmentStatusesService,
    transfersService,
    prisonService,
    raiseAnalyticsEvent,
    lockManager,
    feComponentsService,
  }
}

export type Services = ReturnType<typeof services>

export {
  BodyScanInfoDecorator,
  MatchTypeDecorator,
  UserService,
  NotificationService,
  ExpectedArrivalsService,
  TemporaryAbsencesService,
  ImprisonmentStatusesService,
  TransfersService,
  PrisonService,
  RaiseAnalyticsEvent,
  FeComponentsService,
  OffenceInfoDecorator,
}
