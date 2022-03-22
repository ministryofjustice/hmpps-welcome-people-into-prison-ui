import type { RequestHandler, Response, Request } from 'express'
import type { ExpectedArrivalsService } from '../../../services'
import { State } from '../arrivals/state'

export default class SearchForExistingRecordsController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      res.render('pages/unexpectedArrivals/searchForExistingRecord.njk', {
        errors: req.flash('errors'),
        data: req.flash('input')[0],
      })
    }
  }

  public submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      if (req.errors) {
        req.flash('input', req.body)
        return res.redirect('/manually-confirm-arrival/search-for-existing-record')
      }

      const { firstName, lastName, year, month, day, prisonNumber, pncNumber } = req.body
      const dateOfBirth = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

      const potentialMatches = await this.expectedArrivalsService.getMatchingRecords({
        firstName,
        lastName,
        dateOfBirth,
        prisonNumber: prisonNumber || undefined,
        pncNumber: pncNumber || undefined,
      })

      if (potentialMatches.length === 1) {
        const match = potentialMatches[0]
        State.newArrival.set(res, {
          firstName: match.firstName,
          lastName: match.lastName,
          dateOfBirth: match.dateOfBirth,
          prisonNumber: match.prisonNumber,
          pncNumber: match.pncNumber,
        })
        return res.redirect('/manually-confirm-arrival/search-for-existing-record/record-found')
      }

      State.newArrival.clear(res)

      return potentialMatches.length > 1
        ? res.redirect('/manually-confirm-arrival/search-for-existing-record/possible-records-found')
        : res.redirect('/manually-confirm-arrival/search-for-existing-record/no-record-found')
    }
  }
}
