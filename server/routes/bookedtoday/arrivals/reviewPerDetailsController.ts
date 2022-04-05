import { RequestHandler, Response } from 'express'
import type { ExpectedArrivalsService } from '../../../services'
import { NewArrival, State } from './state'
import { convertToTitleCase } from '../../../utils/utils'

export default class ReviewPerDetailsController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  private async loadData(id: string, res: Response): Promise<NewArrival> {
    const arrival = await this.expectedArrivalsService.getArrival(id)

    const data = {
      firstName: convertToTitleCase(arrival.firstName),
      lastName: convertToTitleCase(arrival.lastName),
      dateOfBirth: arrival.dateOfBirth,
      sex: arrival.gender,
      pncNumber: arrival.pncNumber,
      expected: true,
    }

    State.newArrival.set(res, data)

    return data
  }

  public newReview(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      State.newArrival.clear(res)
      res.redirect(`/prisoners/${id}/review-per-details`)
    }
  }

  public showReview(): RequestHandler {
    return async (req, res, next) => {
      const { id } = req.params

      const data = State.newArrival.get(req) || (await this.loadData(id, res))

      res.render('pages/bookedtoday/arrivals/reviewPerDetails.njk', {
        data: { ...data, id },
      })
    }
  }
}
