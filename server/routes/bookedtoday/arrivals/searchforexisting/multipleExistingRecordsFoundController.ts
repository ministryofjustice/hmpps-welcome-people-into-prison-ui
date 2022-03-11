import type { RequestHandler, Request, Response } from 'express'
import type { ExpectedArrivalsService } from '../../../../services'
import { State } from '../state'

export default class MultipleExistingRecordsFoundController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { id } = req.params
      const searchData = State.searchDetails.get(req)

      const arrival = {
        firstName: searchData.firstName,
        lastName: searchData.lastName,
        dateOfBirth: searchData.dateOfBirth,
      }

      const potentialMatches = await this.expectedArrivalsService.getMatchingRecords(searchData)

      res.render('pages/bookedtoday/arrivals/searchforexisting/multipleExistingRecordsFound.njk', {
        arrival,
        data: { potentialMatches, id },
        errors: req.flash('errors'),
      })
    }
  }

  public submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { id } = req.params

      if (req.errors) {
        req.flash('errors', req.body)
        return res.redirect(`/prisoners/${id}/possible-records-found`)
      }

      const { prisonNumber } = req.body
      const selectedRecord = await this.expectedArrivalsService.getPrisonerDetails(prisonNumber)

      State.newArrival.set(res, selectedRecord)

      return res.redirect(`/prisoners/${id}/sex`)
    }
  }
}
