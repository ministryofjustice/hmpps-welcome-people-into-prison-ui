import type { RequestHandler } from 'express'
import { State } from '../arrivals/state'

export default class SingleMatchingRecordFoundController {
  public view(): RequestHandler {
    return async (req, res) => {
      const data = { ...State.searchDetails.get(req), potentialMatches: [State.newArrival.get(req)] }

      return res.render('pages/unexpectedArrivals/singleExistingRecordFound.njk', { data })
    }
  }
}
