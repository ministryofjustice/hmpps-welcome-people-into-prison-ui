import { RequestHandler } from 'express'

export default class accessibilityStatementController {
  public view(): RequestHandler {
    return async (req, res) => {
      return res.render('pages/accessibilityStatement.njk', {})
    }
  }
}
