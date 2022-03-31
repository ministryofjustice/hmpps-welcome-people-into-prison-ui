import type { RequestHandler, Response, Request } from 'express'
import { State } from '../arrivals/state'

export default class NoExistingRecordsFoundController {
  public view(): RequestHandler {
    return async (req: Request, res: Response) => {
      const searchData = State.searchDetails.get(req)

      return res.render('pages/unexpectedArrivals/noExistingRecordsFound.njk', {
        data: {
          firstName: searchData.firstName,
          lastName: searchData.lastName,
          dateOfBirth: searchData.dateOfBirth,
          prisonNumber: searchData.prisonNumber,
          pncNumber: searchData.pncNumber,
        },
      })
    }
  }

  public submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      return res.redirect('/manually-confirm-arrival/add-personal-details')
    }
  }
}
