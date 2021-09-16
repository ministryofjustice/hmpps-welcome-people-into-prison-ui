import { dataAccess } from '../data'
import UserService from './userService'
import IncomingMovementsService from './incomingMovementsService'

const { hmppsAuthClient, welcomeClientBuilder } = dataAccess

const userService = new UserService(hmppsAuthClient)
const incomingMovementsService = new IncomingMovementsService(hmppsAuthClient, welcomeClientBuilder)

export const services = {
  userService,
  incomingMovementsService,
}

export type Services = typeof services

export { UserService, IncomingMovementsService }
