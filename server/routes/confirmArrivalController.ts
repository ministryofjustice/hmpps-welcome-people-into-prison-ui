import { RequestHandler } from 'express'
import ExpectedArrivalsService from '../services/expectedArrivalsService'
import { clearImprisonmentStatus } from './state'

export default class ConfirmArrivalController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public confirmArrival(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const data = await this.expectedArrivalsService.getMove(id)
      clearImprisonmentStatus(res)
      res.render('pages/confirmArrival.njk', { data })
    }
  }
}
