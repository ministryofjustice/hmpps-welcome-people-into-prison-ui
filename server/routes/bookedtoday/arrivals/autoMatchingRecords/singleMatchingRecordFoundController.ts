import type { RequestHandler } from 'express'
import { State } from '../state'
import type { ExpectedArrivalsService } from '../../../../services'
import { convertToTitleCase } from '../../../../utils/utils'

export default class SingleMatchingRecordFoundController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { username } = req.user
      const arrival = await this.expectedArrivalsService.getArrival(username, id)

      const match = arrival.potentialMatches[0]
      State.newArrival.set(res, {
        firstName: convertToTitleCase(match.firstName),
        lastName: convertToTitleCase(match.lastName),
        dateOfBirth: match.dateOfBirth,
        sex: match.sex,
        prisonNumber: match.prisonNumber,
        pncNumber: match.pncNumber,
        expected: true,
      })

      return res.render('pages/bookedtoday/arrivals/autoMatchingRecords/singleMatchingRecordFound.njk', {
        arrival: {
          firstName: arrival.firstName,
          lastName: arrival.lastName,
          dateOfBirth: arrival.dateOfBirth,
          prisonNumber: arrival.prisonNumber,
          pncNumber: arrival.pncNumber,
        },
        data: {
          firstName: match.firstName,
          lastName: match.lastName,
          dateOfBirth: match.dateOfBirth,
          prisonNumber: match.prisonNumber,
          pncNumber: match.pncNumber,
          id,
        },
      })
    }
  }
}
