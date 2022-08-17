import { RequestHandler } from 'express'

export default class FeedbackConfirmationController {
  public view(): RequestHandler {
    return async (req, res) => {
      return res.render('pages/feedbackConfirmation.njk', {})
    }
  }
}
