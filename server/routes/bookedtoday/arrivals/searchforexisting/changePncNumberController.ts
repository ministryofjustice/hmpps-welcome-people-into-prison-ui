import type { RequestHandler } from 'express'
import type { ExpectedArrivalsService } from '../../../../services'

export default class ChangePncNumberController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public showChangePncNumber(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const data = await this.expectedArrivalsService.getArrival(id)
      res.render('pages/bookedtoday/arrivals/searchForExistingRecord/changePncNumber.njk', { data })
    }
  }
}
