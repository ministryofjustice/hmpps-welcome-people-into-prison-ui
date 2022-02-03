import type { RequestHandler } from 'express'
import type { ExpectedArrivalsService } from '../../../../services'

export default class SearchForExistingRecordController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public showSearch(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const data = await this.expectedArrivalsService.getArrival(id)
      res.render('pages/bookedtoday/arrivals/searchForExistingRecord/searchForExistingRecord.njk', { data })
    }
  }
}
