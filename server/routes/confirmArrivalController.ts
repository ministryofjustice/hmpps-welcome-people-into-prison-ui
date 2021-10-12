import { RequestHandler } from 'express'
import ExpectedArrivalsService from '../services/expectedArrivalsService'

export default class ConfirmArrivalController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public confirmArrival(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const data = await this.expectedArrivalsService.getMove(id)
      res.render('pages/confirmArrival.njk', { data })
    }
  }
}
