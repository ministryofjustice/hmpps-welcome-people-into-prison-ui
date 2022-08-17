import config from '../config'

export type EmailPersonalisation = {
  username: string
  prison: string
  feedback: string
  email: string
}

export default class NotificationService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly notifyClient: any) {}

  public async sendEmail(personalisation: EmailPersonalisation): Promise<void> {
    return this.notifyClient.sendEmail(config.notifications.feedbackTemplateId, config.notifications.feedbackEmail, {
      personalisation,
      reference: null,
    })
  }
}
