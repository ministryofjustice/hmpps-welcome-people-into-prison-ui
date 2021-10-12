import { RequestHandler } from 'express'
import ExpectedArrivalsService from '../services/expectedArrivalsService'

export default class ConfirmArrivalController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public confirmArrival(): RequestHandler {
    return async (req, res) => {
      const { UUID } = req.params
      const { firstName, lastName, dateOfBirth, prisonNumber, pncNumber } = await this.expectedArrivalsService.getMove(
        UUID
      )
      const data = {
        UUID,
        firstName,
        lastName,
        dateOfBirth,
        prisonNumber,
        pncNumber,
      }
      res.render('pages/confirmArrival.njk', { data })
    }
  }
}
