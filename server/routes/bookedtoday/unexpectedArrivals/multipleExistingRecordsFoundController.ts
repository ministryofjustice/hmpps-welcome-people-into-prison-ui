import type { RequestHandler, Request, Response } from 'express'
import type { ExpectedArrivalsService } from '../../../services'
import { State } from '../arrivals/state'

export default class MultipleExistingRecordsFoundController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req: Request, res: Response) => {
      const searchData = State.searchDetails.get(req)

      const potentialMatches = await this.expectedArrivalsService.getMatchingRecords(searchData)

      res.render('pages/unexpectedArrivals/multipleExistingRecordsFound.njk', {
        arrival: {
          firstName: searchData.firstName,
          lastName: searchData.lastName,
          dateOfBirth: searchData.dateOfBirth,
          prisonNumber: searchData.prisonNumber,
          pncNumber: searchData.pncNumber,
        },
        data: { potentialMatches },
        errors: req.flash('errors'),
      })
    }
  }
}
