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
import HmppsAuthClient from '../data/hmppsAuthClient'
import { RedisTokenStore } from '../data/tokenStore'
import { redisClient } from '../data/redisClient'

export const services = () => {
  const {
    hmppsAuthClient,
    welcomeClientBuilder,
    prisonRegisterClientBuilder,
    bodyScanClientBuilder,
    notifyClient,
    lockManager,
  } = dataAccess()

  const authService = new HmppsAuthClient(new RedisTokenStore(redisClient))

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
  const prisonService = new PrisonService(hmppsAuthClient, prisonRegisterClientBuilder)

  return {
    authService,
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
  OffenceInfoDecorator,
}
