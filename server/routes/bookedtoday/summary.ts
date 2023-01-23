import type { RequestHandler } from 'express'
import { ExpectedArrivalsService } from '../../services'
import { calculateAge } from '../../utils/utils'

export default class SummaryController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const arrival = await this.expectedArrivalsService.getArrival(id)
      const arrivalAge = calculateAge(arrival.dateOfBirth)
      return res.render('pages/bookedtoday/summary.njk', { arrival, arrivalAge })
    }
  }
}
