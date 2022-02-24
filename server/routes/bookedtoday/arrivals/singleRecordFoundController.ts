import type { RequestHandler } from 'express'
import { State } from './state'
import type { ExpectedArrivalsService } from '../../../services'

export default class SingleRecordFoundController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const existingArrival = State.newArrival.get(req)
      const perRecord = await this.expectedArrivalsService.getArrival(id)

      return res.render('pages/bookedtoday/arrivals/singleMatchFound.njk', { id, perRecord, existingArrival })
    }
  }
}
