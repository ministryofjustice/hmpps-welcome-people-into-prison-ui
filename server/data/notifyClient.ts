import { NotifyClient } from 'notifications-node-client'
import config from '../config'

type NotifyClientLike = {
  sendEmail: (...args: unknown[]) => Promise<void>
}

const notifyClient: NotifyClientLike = config.notifications.notifyKey
  ? new NotifyClient(config.notifications.notifyKey)
  : {
      async sendEmail() {
        return undefined
      },
    }

export default notifyClient
