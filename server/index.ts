// Require app insights before anything else to allow for instrumentation of bunyan and express
import './utils/azureAppInsights'

import createApp from './app'
import { services as wpipServicesBuilder } from './services'
import { services as bodyScanServicesBuilder } from './bodyscan/services'

const wpipServices = wpipServicesBuilder()
const bodyScanServices = bodyScanServicesBuilder(wpipServices)

const app = createApp(wpipServices, bodyScanServices)

export default app
