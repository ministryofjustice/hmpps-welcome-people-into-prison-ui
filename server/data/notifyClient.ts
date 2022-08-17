import { NotifyClient } from 'notifications-node-client'
import config from '../config'

const notifyClient = new NotifyClient(config.notifications.notifyKey)

export default notifyClient
