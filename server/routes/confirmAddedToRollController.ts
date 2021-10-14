import { RequestHandler } from 'express'

export default class ConfirmAddedToRollController {
  public view(): RequestHandler {
    return async (req, res) => {
      return res.render('pages/confirmAddedToRoll')
    }
  }
}
