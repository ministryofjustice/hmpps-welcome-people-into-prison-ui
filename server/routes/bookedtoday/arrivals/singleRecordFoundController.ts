import type { RequestHandler } from 'express'
import { State } from './state'
import type { ExpectedArrivalsService } from '../../../services'
import { convertToTitleCase } from '../../../utils/utils'

export default class SingleRecordFoundController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const data = await this.expectedArrivalsService.getArrival(id)

      const match = data.potentialMatches[0]
      State.newArrival.set(res, {
        firstName: convertToTitleCase(match.firstName),
        lastName: convertToTitleCase(match.lastName),
        dateOfBirth: match.dateOfBirth,
        // TODO: add sex to potential match object on cookie
        sex: data.gender,
        prisonNumber: match.prisonNumber,
        pncNumber: match.pncNumber,
      })

      return res.render('pages/bookedtoday/arrivals/singleMatchFound.njk', { data })
    }
  }
}
