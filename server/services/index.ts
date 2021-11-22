import { dataAccess } from '../data'
import UserService from './userService'
import ExpectedArrivalsService from './expectedArrivalsService'
import TemporaryAbsencesService from './temporaryAbsencesService'
import ImprisonmentStatusesService from './imprisonmentStatusesService'
import TransfersService from './transfersService'

const { hmppsAuthClient, welcomeClientBuilder } = dataAccess
const userService = new UserService(hmppsAuthClient)
const expectedArrivalsService = new ExpectedArrivalsService(hmppsAuthClient, welcomeClientBuilder)
const temporaryAbsencesService = new TemporaryAbsencesService(hmppsAuthClient, welcomeClientBuilder)
const imprisonmentStatusesService = new ImprisonmentStatusesService(hmppsAuthClient, welcomeClientBuilder)
const transfersService = new TransfersService(hmppsAuthClient, welcomeClientBuilder)

export const services = {
  userService,
  expectedArrivalsService,
  temporaryAbsencesService,
  imprisonmentStatusesService,
  transfersService,
}

export type Services = typeof services

export { UserService, ExpectedArrivalsService, TemporaryAbsencesService, ImprisonmentStatusesService, TransfersService }
