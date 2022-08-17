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

export const services = () => {
  const { hmppsAuthClient, welcomeClientBuilder, bodyScanClientBuilder, notifyClient } = dataAccess()

  const bodyScanInfoDecorator = new BodyScanInfoDecorator(hmppsAuthClient, bodyScanClientBuilder)
  const userService = new UserService(hmppsAuthClient, welcomeClientBuilder)
  const notificationService = new NotificationService(notifyClient)
  const expectedArrivalsService = new ExpectedArrivalsService(
    hmppsAuthClient,
    welcomeClientBuilder,
    raiseAnalyticsEvent,
    bodyScanInfoDecorator
  )
  const temporaryAbsencesService = new TemporaryAbsencesService(
    hmppsAuthClient,
    welcomeClientBuilder,
    bodyScanInfoDecorator
  )
  const imprisonmentStatusesService = new ImprisonmentStatusesService(hmppsAuthClient, welcomeClientBuilder)
  const transfersService = new TransfersService(hmppsAuthClient, welcomeClientBuilder)
  const prisonService = new PrisonService(hmppsAuthClient, welcomeClientBuilder)

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
  }
}

export type Services = ReturnType<typeof services>

export {
  BodyScanInfoDecorator,
  UserService,
  NotificationService,
  ExpectedArrivalsService,
  TemporaryAbsencesService,
  ImprisonmentStatusesService,
  TransfersService,
  PrisonService,
  RaiseAnalyticsEvent,
}
