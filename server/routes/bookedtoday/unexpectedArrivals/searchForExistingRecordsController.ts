import type { RequestHandler, Response, Request } from 'express'
import type { ExpectedArrivalsService } from '../../../services'
import sanitiseSearchCriteria from '../../../services/sanitiseSearch'
import { State } from '../arrivals/state'

type FlashErrors = [{ text: string; href: string }]

export default class SearchForExistingRecordsController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      let expandDetails = false
      const errors = req.flash('errors') as FlashErrors
      const prisonNumberError = errors.filter(error => error.href === '#prison-number')
      if (prisonNumberError.length) {
        expandDetails = true
      }

      res.render('pages/unexpectedArrivals/searchForExistingRecord.njk', {
        errors,
        data: req.flash('input')[0],
        expandDetails,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      if (req.errors) {
        req.flash('input', req.body)
        return res.redirect('/manually-confirm-arrival/search-for-existing-record')
      }

      const searchData = sanitiseSearchCriteria(req.body)
      const { systemToken } = req.session

      const potentialMatches = await this.expectedArrivalsService.getMatchingRecords(systemToken, searchData)
      State.searchDetails.set(res, searchData)

      if (potentialMatches.length === 1) {
        const match = potentialMatches[0]
        State.newArrival.set(res, {
          firstName: match.firstName,
          lastName: match.lastName,
          dateOfBirth: match.dateOfBirth,
          prisonNumber: match.prisonNumber,
          sex: match.sex,
          pncNumber: match.pncNumber,
          expected: false,
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
