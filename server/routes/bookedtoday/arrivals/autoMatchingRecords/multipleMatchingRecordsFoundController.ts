import type { Request, RequestHandler, Response } from 'express'
import { ExpectedArrivalsService } from '../../../../services'
import { State } from '../state'

export default class MultipleExistingRecordsFoundController {
  constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { id } = req.params

      const arrival = await this.expectedArrivalsService.getArrival(id)

      return res.render('pages/bookedtoday/arrivals/autoMatchingRecords/multipleMatchingRecordsFound.njk', {
        arrival: {
          firstName: arrival.firstName,
          lastName: arrival.lastName,
          dateOfBirth: arrival.dateOfBirth,
          prisonNumber: arrival.prisonNumber,
          pncNumber: arrival.pncNumber,
        },
        data: { potentialMatches: arrival.potentialMatches, id },
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
