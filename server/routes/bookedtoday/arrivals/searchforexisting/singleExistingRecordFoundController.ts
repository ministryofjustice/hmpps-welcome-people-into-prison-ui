import type { RequestHandler } from 'express'
import { State } from '../state'

export default class SingleExistingRecordFoundController {
  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const potentialMatch = State.newArrival.get(req)
      const searchData = State.searchDetails.get(req)

      return res.render('pages/bookedtoday/arrivals/searchforexisting/singleExistingRecordFound.njk', {
        arrival: {
          firstName: searchData.firstName,
          lastName: searchData.lastName,
          dateOfBirth: searchData.dateOfBirth,
          prisonNumber: searchData.prisonNumber,
          pncNumber: searchData.pncNumber,
        },
        data: { potentialMatch, id },
      })
    }
  }
}
