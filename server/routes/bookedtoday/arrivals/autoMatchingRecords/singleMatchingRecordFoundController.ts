import type { RequestHandler } from 'express'
import { State } from '../state'
import type { ExpectedArrivalsService } from '../../../../services'
import { convertToTitleCase } from '../../../../utils/utils'

export default class SingleMatchingRecordFoundController {
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
        sex: match.sex,
        prisonNumber: match.prisonNumber,
        pncNumber: match.pncNumber,
      })

      return res.render('pages/bookedtoday/arrivals/autoMatchingRecords/singleMatchingRecordFound.njk', { data })
    }
  }
}
