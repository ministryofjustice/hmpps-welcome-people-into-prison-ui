import { RequestHandler } from 'express'
import ExpectedArrivalsService from '../services/expectedArrivalsService'

export default class ChoosePrisonerController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { activeCaseLoadId } = res.locals.user
      const expectedArrivals = await this.expectedArrivalsService.getArrivalsForToday(activeCaseLoadId)
      return res.render('pages/choosePrisoner.njk', {
        expectedArrivals,
      })
    }
  }
}
