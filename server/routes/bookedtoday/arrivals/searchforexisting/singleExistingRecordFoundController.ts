import type { RequestHandler } from 'express'
import { PotentialMatch } from 'welcome'
import { State } from '../state'
import { ExpectedArrivalsService } from '../../../../services'
import { convertToTitleCase } from '../../../../utils/utils'

export default class SingleExistingRecordFoundController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  private validateSingleMatch(potentialMatches: PotentialMatch[]): PotentialMatch {
    if (potentialMatches.length !== 1) {
      throw new Error(`Incorrect potential match length: ${potentialMatches.length}`)
    }
    return potentialMatches[0]
  }

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const searchData = State.searchDetails.get(req)
      const potentialMatches = await this.expectedArrivalsService.getMatchingRecords(searchData)
      const potentialMatch = this.validateSingleMatch(potentialMatches)

      return res.render('pages/bookedtoday/arrivals/searchforexisting/singleExistingRecordFound.njk', {
        arrival: {
          firstName: searchData.firstName,
          lastName: searchData.lastName,
          dateOfBirth: searchData.dateOfBirth,
          prisonNumber: searchData.prisonNumber,
          pncNumber: searchData.pncNumber,
        },
        data: { potentialMatch, id },
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const searchData = State.searchDetails.get(req)
      const potentialMatches = await this.expectedArrivalsService.getMatchingRecords(searchData)
      const potentialMatch = this.validateSingleMatch(potentialMatches)

      State.newArrival.set(res, {
        firstName: convertToTitleCase(potentialMatch.firstName),
        lastName: convertToTitleCase(potentialMatch.lastName),
        dateOfBirth: potentialMatch.dateOfBirth,
        sex: potentialMatch.sex,
        prisonNumber: potentialMatch.prisonNumber,
        pncNumber: potentialMatch.pncNumber,
        expected: true,
      })

      return res.redirect(`/prisoners/${id}/start-confirmation`)
    }
  }
}
