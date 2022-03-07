import type { RequestHandler, Response } from 'express'
import type { ExpectedArrivalsService } from '../../../../services'
import { SearchDetails, State } from './state'

export default class SearchForExistingRecordController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  private async loadData(id: string, res: Response): Promise<SearchDetails> {
    const arrival = await this.expectedArrivalsService.getArrival(id)

    const data = {
      firstName: arrival.firstName,
      lastName: arrival.lastName,
      dateOfBirth: arrival.dateOfBirth,
      pncNumber: arrival.pncNumber,
      prisonNumber: arrival.prisonNumber,
    }

    State.searchDetails.set(res, data)

    return data
  }

  public newSearch(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      State.searchDetails.clear(res)
      res.redirect(`/prisoners/${id}/search-for-existing-record`)
    }
  }

  public showSearch(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params

      const data = State.searchDetails.get(req) || (await this.loadData(id, res))

      res.render('pages/bookedtoday/arrivals/searchForExistingRecord.njk', {
        data: { ...data, id },
      })
    }
  }
}
