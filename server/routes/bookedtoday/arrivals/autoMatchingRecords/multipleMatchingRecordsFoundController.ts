import type { Request, RequestHandler, Response } from 'express'
import { ExpectedArrivalsService } from '../../../../services'
import { State } from '../state'

export default class MultipleExistingRecordsFoundController {
  constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { id } = req.params
      const { systemToken } = req.session

      const arrival = await this.expectedArrivalsService.getArrival(systemToken, id)

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
      const { systemToken } = req.session

      if (req.errors) {
        req.flash('errors', req.body)
        return res.redirect(`/prisoners/${id}/possible-records-found`)
      }

      const { prisonNumber } = req.body
      const selectedRecord = await this.expectedArrivalsService.getPrisonerDetails(systemToken, prisonNumber)

      State.newArrival.set(res, { ...selectedRecord, expected: true })

      return res.redirect(`/prisoners/${id}/start-confirmation`)
    }
  }
}
