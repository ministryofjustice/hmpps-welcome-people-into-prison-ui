import type { RequestHandler, Response, Request } from 'express'
import type { ExpectedArrivalsService } from '../../../../../services'
import { SearchDetails, State } from '../../state'

export default class SearchForExistingRecordController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  private async loadData(token: string, id: string, res: Response): Promise<SearchDetails> {
    const arrival = await this.expectedArrivalsService.getArrival(token, id)

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
      const { systemToken } = req.session

      const data = State.searchDetails.get(req) || (await this.loadData(systemToken, id, res))

      res.render('pages/bookedtoday/arrivals/searchforexisting/search/searchForExistingRecord.njk', {
        data: { ...data, id },
      })
    }
  }

  public submitSearch(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { id } = req.params
      const { systemToken } = req.session
      const searchData = State.searchDetails.get(req)
      const potentialMatches = await this.expectedArrivalsService.getMatchingRecords(systemToken, searchData)

      if (potentialMatches.length === 1) {
        const match = potentialMatches[0]
        State.newArrival.set(res, {
          firstName: match.firstName,
          lastName: match.lastName,
          dateOfBirth: match.dateOfBirth,
          sex: match.sex,
          prisonNumber: match.prisonNumber,
          pncNumber: match.pncNumber,
          expected: true,
        })

        return res.redirect(`/prisoners/${id}/search-for-existing-record/record-found`)
      }

      State.newArrival.clear(res)

      return potentialMatches.length > 1
        ? res.redirect(`/prisoners/${id}/search-for-existing-record/possible-records-found`)
        : res.redirect(`/prisoners/${id}/search-for-existing-record/no-record-found`)
    }
  }
}
