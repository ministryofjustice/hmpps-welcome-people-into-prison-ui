import { RequestHandler } from 'express'
import ExpectedArrivalsService from '../services/expectedArrivalsService'
import { clearImprisonmentStatus, clearSex } from './state'

export default class ConfirmArrivalController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public confirmArrival(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const data = await this.expectedArrivalsService.getArrival(id)
      clearImprisonmentStatus(res)
      clearSex(res)
      res.render('pages/confirmArrival.njk', { data })
    }
  }
}
