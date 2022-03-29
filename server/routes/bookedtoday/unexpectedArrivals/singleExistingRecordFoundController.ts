import type { RequestHandler } from 'express'
import { State } from '../arrivals/state'

export default class SingleMatchingRecordFoundController {
  public view(): RequestHandler {
    return async (req, res) => {
      const potentialMatch = State.newArrival.get(req)
      const searchData = State.searchDetails.get(req)

      return res.render('pages/unexpectedArrivals/singleExistingRecordFound.njk', {
        data: {
          firstName: searchData.firstName,
          lastName: searchData.lastName,
          dateOfBirth: searchData.dateOfBirth,
          prisonNumber: searchData.prisonNumber,
          pncNumber: searchData.pncNumber,
        },
        potentialMatch,
      })
    }
  }
}
