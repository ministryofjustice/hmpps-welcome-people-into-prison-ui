import createApp from './app'
import HmppsAuthClient from './data/hmppsAuthClient'
import TokenStore from './data/tokenStore'
import UserService from './services/userService'
import IncomingMovementsService from './services/incomingMovementsService'
import WelcomeClient from './data/welcomeClient'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const userService = new UserService(hmppsAuthClient)
const incomingMovementsService = new IncomingMovementsService(hmppsAuthClient, token => new WelcomeClient(token))

const app = createApp(userService, incomingMovementsService)

export default app
