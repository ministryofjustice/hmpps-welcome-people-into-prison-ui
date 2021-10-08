import { RequestHandler } from 'express'

export default class ConfirmArrivalController {
  public confirmArrival(): RequestHandler {
    return async (req, res) => {
      res.render('pages/confirmArrival.njk')
    }
  }
}
