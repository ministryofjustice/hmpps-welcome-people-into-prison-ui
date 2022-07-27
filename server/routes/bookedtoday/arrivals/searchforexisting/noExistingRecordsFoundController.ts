import type { RequestHandler, Request, Response } from 'express'
import type { ExpectedArrivalsService } from '../../../../services'
import { State } from '../state'
import { convertToTitleCase } from '../../../../utils/utils'

export default class NoMatchingRecordsFoundController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const searchData = State.searchDetails.get(req)

      return res.render('pages/bookedtoday/arrivals/searchforexisting/noExistingRecordsFound.njk', {
        arrival: {
          firstName: searchData.firstName,
          lastName: searchData.lastName,
          dateOfBirth: searchData.dateOfBirth,
        },
        id,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { id } = req.params

      const arrival = await this.expectedArrivalsService.getArrival(id)
      const searchData = State.searchDetails.get(req)

      const data = {
        firstName: convertToTitleCase(searchData.firstName),
        lastName: convertToTitleCase(searchData.lastName),
        dateOfBirth: searchData.dateOfBirth,
        sex: arrival.gender,
        pncNumber: searchData.pncNumber,
        expected: true,
      }

      State.newArrival.set(res, data)

      return res.redirect(`/prisoners/${id}/review-per-details`)
    }
  }
}
