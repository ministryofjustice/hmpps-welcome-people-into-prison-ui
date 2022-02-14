import { RequestHandler } from 'express'
import type { ExpectedArrivalsService, PrisonService } from '../../../services'
import { State } from './state'

export default class ConfirmAddedToRollController {
  public constructor(
    private readonly expectedArrivalsService: ExpectedArrivalsService,
    private readonly prisonService: PrisonService
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber, location } = req.flash('arrivalResponse')?.[0] as Record<string, string>
      if (!prisonNumber || !location) {
        return res.redirect('/confirm-arrival/choose-prisoner')
      }
      const { id } = req.params
      const { activeCaseLoadId } = res.locals.user
      const data = await this.expectedArrivalsService.getArrival(id)
      const prison = await this.prisonService.getPrison(activeCaseLoadId)
      State.imprisonmentStatus.clear(res)
      State.sex.clear(res)
      return res.render('pages/bookedtoday/arrivals/confirmAddedToRoll.njk', { data, prison, prisonNumber, location })
    }
  }
}
