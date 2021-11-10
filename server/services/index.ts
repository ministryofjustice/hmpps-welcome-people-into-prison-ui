import { dataAccess } from '../data'
import UserService from './userService'
import ExpectedArrivalsService from './expectedArrivalsService'
import TemporaryAbsencesService from './temporaryAbsencesService'
import ImprisonmentStatusesService from './imprisonmentStatusesService'

const { hmppsAuthClient, welcomeClientBuilder } = dataAccess

const userService = new UserService(hmppsAuthClient)
const expectedArrivalsService = new ExpectedArrivalsService(hmppsAuthClient, welcomeClientBuilder)
const temporaryAbsencesService = new TemporaryAbsencesService(hmppsAuthClient, welcomeClientBuilder)
const imprisonmentStatusesService = new ImprisonmentStatusesService(hmppsAuthClient, welcomeClientBuilder)

export const services = {
  userService,
  expectedArrivalsService,
  temporaryAbsencesService,
  imprisonmentStatusesService,
}

export type Services = typeof services

export { UserService, ExpectedArrivalsService, TemporaryAbsencesService, ImprisonmentStatusesService }
