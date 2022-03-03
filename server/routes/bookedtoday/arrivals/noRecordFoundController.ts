import type { RequestHandler } from 'express'
import { ExpectedArrivalsService } from '../../../services'

export default class NoRecordFoundController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const data = await this.expectedArrivalsService.getArrival(id)

      return res.render('pages/bookedtoday/arrivals/noMatchFound.njk', { data })
    }
  }
}
