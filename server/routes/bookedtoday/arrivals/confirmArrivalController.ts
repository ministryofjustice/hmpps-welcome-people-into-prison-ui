import type { RequestHandler } from 'express'
import type { ExpectedArrivalsService } from '../../../services'
import { clearImprisonmentStatus, clearSex } from './state'

export default class ConfirmArrivalController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public confirmArrival(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const data = await this.expectedArrivalsService.getArrival(id)
      clearImprisonmentStatus(res)
      clearSex(res)
      res.render('pages/bookedtoday/arrivals/confirmArrival.njk', { data })
    }
  }
}