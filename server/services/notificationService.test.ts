import NotificationService, { type EmailPersonalisation } from './notificationService'
import config from '../config'

const notifyClient = {
  sendEmail: jest.fn(),
}

describe('Notification service', () => {
  let notificationService: NotificationService

  beforeEach(() => {
    notificationService = new NotificationService(notifyClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Send feedback email', () => {
    const feedbackEmail: EmailPersonalisation = {
      username: 'A_USER',
      prison: 'MDI',
      feedback: 'Some feedback',
      email: 'a.user@email',
    }

    it('should send personalisation', async () => {
      notifyClient.sendEmail.mockResolvedValue({})

      await notificationService.sendEmail(feedbackEmail)

      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        config.notifications.feedbackTemplateId,
        config.notifications.feedbackEmail,
        {
          personalisation: {
            username: 'A_USER',
            prison: 'MDI',
            feedback: 'Some feedback',
            email: 'a.user@email',
          },
          reference: null,
        },
      )
    })
  })
})
