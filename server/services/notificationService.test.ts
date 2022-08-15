import NotificationService, { type EmailPersonalisation } from './notificationService'
import config from '../config'

const notifyApi = {
  sendEmail: jest.fn(),
}

describe('Notification service', () => {
  let notificationService: NotificationService

  beforeEach(() => {
    notificationService = new NotificationService(notifyApi)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Send feedback email', () => {
    const feedbackEmail: EmailPersonalisation = {
      username: 'A_USER',
      agencyId: 'MDI',
      feedback: 'Some feedback',
    }

    it('Details are retrieved for user', async () => {
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendEmail(feedbackEmail)
    })

    it('should send personalisation with optional fields', async () => {
      notifyApi.sendEmail.mockResolvedValue({})

      await notificationService.sendEmail({
        ...feedbackEmail,
        email: 'a.user@email',
      })

      expect(notifyApi.sendEmail).toHaveBeenCalledWith(
        config.notifications.feedbackTemplateId,
        config.notifications.feedbackEmail,
        {
          personalisation: {
            username: 'A_USER',
            agencyId: 'MDI',
            feedback: 'Some feedback',
            email: 'a.user@email',
          },
          reference: null,
        }
      )
    })
  })
})
