import type { RequestHandler } from 'express'
import { ExpectedArrivalsService } from '../../../services'
import { State } from './state'
import { convertToTitleCase } from '../../../utils/utils'

export default class NoRecordFoundController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const data = await this.expectedArrivalsService.getArrival(id)

      State.newArrival.set(res, {
        firstName: convertToTitleCase(data.firstName),
        lastName: convertToTitleCase(data.lastName),
        dateOfBirth: data.dateOfBirth,
        sex: data.gender,
        prisonNumber: data.prisonNumber,
        pncNumber: data.pncNumber,
      })

      return res.render('pages/bookedtoday/arrivals/noMatchFound.njk', { id, data })
    }
  }
}
