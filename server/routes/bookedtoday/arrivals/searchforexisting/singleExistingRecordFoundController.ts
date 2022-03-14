import type { RequestHandler } from 'express'
import { State } from '../state'
import type { ExpectedArrivalsService } from '../../../../services'

export default class SingleExistingRecordFoundController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const existingRecord = State.newArrival.get(req)
      const data = await this.expectedArrivalsService.getArrival(id)

      return res.render('pages/bookedtoday/arrivals/searchforexisting/singleExistingRecordFound.njk', {
        data,
        existingRecord,
      })
    }
  }
}
