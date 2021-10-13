import { RequestHandler } from 'express'

export default class CheckAnswersController {
  public checkAnswers(): RequestHandler {
    return async (req, res) => {
      return res.render('pages/checkAnswers.njk')
    }
  }
}
