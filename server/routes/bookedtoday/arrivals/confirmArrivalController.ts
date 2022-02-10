import type { RequestHandler } from 'express'
import type { ExpectedArrivalsService } from '../../../services'
import { State } from './state'

export default class ConfirmArrivalController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public confirmArrival(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const location = req.flash('location')?.[0]
      if (!location) {
        return res.redirect('/confirm-arrival/choose-prisoner')
      }
      const data = await this.expectedArrivalsService.getArrival(id)
      State.imprisonmentStatus.clear(res)
      State.sex.clear(res)
      return res.render('pages/bookedtoday/arrivals/confirmArrival.njk', { data, location })
    }
  }
}
