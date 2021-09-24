import { dataAccess } from '../data'
import UserService from './userService'
import ExpectedArrivalsService from './expectedArrivalsService'
import TemporaryAbsencesService from './temporaryAbsencesService'

const { hmppsAuthClient, welcomeClientBuilder } = dataAccess

const userService = new UserService(hmppsAuthClient)
const expectedArrivalsService = new ExpectedArrivalsService(hmppsAuthClient, welcomeClientBuilder)
const temporaryAbsencesService = new TemporaryAbsencesService(hmppsAuthClient, welcomeClientBuilder)

export const services = {
  userService,
  expectedArrivalsService,
  temporaryAbsencesService,
}

export type Services = typeof services

export { UserService, ExpectedArrivalsService, TemporaryAbsencesService }
