import type { RequestHandler } from 'express'
import { ExpectedArrivalsService } from '../../../../services'

export default class NoMatchingRecordsFoundController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { username } = req.user
      const data = await this.expectedArrivalsService.getArrival(username, id)

      return res.render('pages/bookedtoday/arrivals/autoMatchingRecords/noMatchingRecordsFound.njk', { data })
    }
  }
}
