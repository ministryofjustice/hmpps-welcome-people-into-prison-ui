import { dataAccess } from '../data'
import UserService from './userService'
import IncomingMovementsService from './incomingMovementsService'
import TemporaryAbsencesService from './temporaryAbsencesService'

const { hmppsAuthClient, welcomeClientBuilder } = dataAccess

const userService = new UserService(hmppsAuthClient)
const incomingMovementsService = new IncomingMovementsService(hmppsAuthClient, welcomeClientBuilder)
const temporaryAbsencesService = new TemporaryAbsencesService(hmppsAuthClient, welcomeClientBuilder)

export const services = {
  userService,
  incomingMovementsService,
  temporaryAbsencesService,
}

export type Services = typeof services

export { UserService, IncomingMovementsService, TemporaryAbsencesService }
