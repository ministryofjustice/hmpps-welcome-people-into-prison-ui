import { NotifyClient } from 'notifications-node-client'
import config from '../config'

const notifyClient = config.notifications.notifyKey
  ? new NotifyClient(config.notifications.notifyKey)
  : ({ sendEmail: async () => undefined } as Partial<NotifyClient>)

export default notifyClient
