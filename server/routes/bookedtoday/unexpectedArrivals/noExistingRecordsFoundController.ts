import type { RequestHandler } from 'express'
import { State } from '../arrivals/state'

export default class NoExistingRecordsFoundController {
  public view(): RequestHandler {
    return async (req, res) => {
      const searchData = State.searchDetails.get(req)

      return res.render('pages/unexpectedArrivals/noExistingRecordsFound.njk', {
        data: {
          firstName: searchData.firstName,
          lastName: searchData.lastName,
          dateOfBirth: searchData.dateOfBirth,
          prisonNumber: searchData.prisonNumber,
          pncNumber: searchData.pncNumber,
        },
      })
    }
  }
}
