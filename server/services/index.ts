import { dataAccess } from '../data'
import UserService from './userService'
import ExpectedArrivalsService from './expectedArrivalsService'
import TemporaryAbsencesService from './temporaryAbsencesService'
import ImprisonmentStatusesService from './imprisonmentStatusesService'
import TransfersService from './transfersService'
import PrisonService from './prisonService'

const { hmppsAuthClient, welcomeClientBuilder } = dataAccess
const userService = new UserService(hmppsAuthClient, welcomeClientBuilder)
const expectedArrivalsService = new ExpectedArrivalsService(hmppsAuthClient, welcomeClientBuilder)
const temporaryAbsencesService = new TemporaryAbsencesService(hmppsAuthClient, welcomeClientBuilder)
const imprisonmentStatusesService = new ImprisonmentStatusesService(hmppsAuthClient, welcomeClientBuilder)
const transfersService = new TransfersService(hmppsAuthClient, welcomeClientBuilder)
const prisonService = new PrisonService(hmppsAuthClient, welcomeClientBuilder)

export const services = {
  userService,
  expectedArrivalsService,
  temporaryAbsencesService,
  imprisonmentStatusesService,
  transfersService,
  prisonService,
}

export type Services = typeof services

export {
  UserService,
  ExpectedArrivalsService,
  TemporaryAbsencesService,
  ImprisonmentStatusesService,
  TransfersService,
  PrisonService,
}
