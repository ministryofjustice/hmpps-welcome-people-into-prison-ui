import { RequestHandler } from 'express'

export default class ConfirmTemporaryAbsenceAddedToRollController {
  public view(): RequestHandler {
    return async (req, res) => {
      return res.render('pages/temporaryabsences/confirmTemporaryAbsenceAddedToRoll.njk', {})
    }
  }
}
