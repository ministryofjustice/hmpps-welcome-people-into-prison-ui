import type { RequestHandler } from 'express'
import type { ExpectedArrivalsService } from '../../../../services'

export default class ChangeDateOfBirthController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public showChangeDateOfBirth(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const data = await this.expectedArrivalsService.getArrival(id)
      res.render('pages/bookedtoday/arrivals/searchForExistingRecord/changeDateOfBirth.njk', { data })
    }
  }
}
