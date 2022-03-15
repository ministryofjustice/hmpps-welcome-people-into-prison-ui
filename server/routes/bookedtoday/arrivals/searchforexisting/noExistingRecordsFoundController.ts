import type { RequestHandler } from 'express'
import { State } from '../state'

export default class NoMatchingRecordsFoundController {
  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const searchData = State.searchDetails.get(req)

      return res.render('pages/bookedtoday/arrivals/searchforexisting/noExistingRecordsFound.njk', {
        arrival: {
          firstName: searchData.firstName,
          lastName: searchData.lastName,
          dateOfBirth: searchData.dateOfBirth,
        },
        id,
      })
    }
  }
}
