import { NotifyClient } from 'notifications-node-client'
import config from '../config'
import stubNotifyClient from './notifyClient.stub'

type NotifyClientLike = {
  sendEmail: (...args: unknown[]) => Promise<void>
}

const notifyClient: NotifyClientLike = config.notifications.notifyKey
  ? new NotifyClient(config.notifications.notifyKey)
  : stubNotifyClient

export default notifyClient
