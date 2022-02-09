import { dataAccess } from '../data'
import UserService from './userService'
import ExpectedArrivalsService from './expectedArrivalsService'
import TemporaryAbsencesService from './temporaryAbsencesService'
import ImprisonmentStatusesService from './imprisonmentStatusesService'
import TransfersService from './transfersService'
import PrisonService from './prisonService'
import { raiseAnalyticsEvent, type RaiseAnalyticsEvent } from './raiseAnalyticsEvent'

export const services = () => {
  const { hmppsAuthClient, welcomeClientBuilder } = dataAccess()

  const userService = new UserService(hmppsAuthClient, welcomeClientBuilder)
  const expectedArrivalsService = new ExpectedArrivalsService(hmppsAuthClient, welcomeClientBuilder)
  const temporaryAbsencesService = new TemporaryAbsencesService(hmppsAuthClient, welcomeClientBuilder)
  const imprisonmentStatusesService = new ImprisonmentStatusesService(hmppsAuthClient, welcomeClientBuilder)
  const transfersService = new TransfersService(hmppsAuthClient, welcomeClientBuilder)
  const prisonService = new PrisonService(hmppsAuthClient, welcomeClientBuilder)

  return {
    userService,
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
  UserService,
  ExpectedArrivalsService,
  TemporaryAbsencesService,
  ImprisonmentStatusesService,
  TransfersService,
  PrisonService,
  RaiseAnalyticsEvent,
}
