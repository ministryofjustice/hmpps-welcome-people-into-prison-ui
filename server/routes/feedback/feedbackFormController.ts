import { RequestHandler } from 'express'
import type { NotificationService, PrisonService } from '../../services'
import logger from '../../../logger'

export default class FeedbackController {
  public constructor(
    private readonly notificationService: NotificationService,
    private readonly prisonService: PrisonService
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      return res.render('pages/feedbackForm.njk', {
        errors: req.flash('errors'),
        data: req.flash('input')[0],
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { username } = req.user
      const { activeCaseLoadId } = res.locals.user
      const { feedback, email } = req.body

      if (req.errors) {
        req.flash('input', req.body)
        return res.redirect(`/feedback`)
      }

      const { prisonName } = await this.prisonService.getPrison(activeCaseLoadId)

      try {
        await this.notificationService.sendEmail({
          username,
          prison: prisonName,
          feedback,
          email: email || '(No email address provided)',
        })
      } catch (e) {
        logger.error('Notify failed: ', e)
      }

      return res.redirect(`/feedback-submitted`)
    }
  }
}
