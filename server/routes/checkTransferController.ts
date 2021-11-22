import { RequestHandler } from 'express'
import ExpectedArrivalsService, { LocationType } from '../services/expectedArrivalsService'

export default class CheckTransferController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public checkTransfer(): RequestHandler {
    return async (req, res) => {
      const { activeCaseLoadId } = res.locals.user
      const { prisonNumber } = req.params
      const expectedArrivals = await this.expectedArrivalsService.getArrivalsForToday(activeCaseLoadId)
      const data = expectedArrivals
        .get('PRISON' as LocationType.PRISON)
        .find(item => item.prisonNumber === prisonNumber)
      return res.render('pages/checkTransfer.njk', { data })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      // TODO: implement post action in next ticket
      res.redirect(`/prisoners/${prisonNumber}/confirmation`)
    }
  }
}
