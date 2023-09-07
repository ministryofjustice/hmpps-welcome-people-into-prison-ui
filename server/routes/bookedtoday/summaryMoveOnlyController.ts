import type { RequestHandler } from 'express'
import { ExpectedArrivalsService } from '../../services'
import Role from '../../authentication/role'

export default class SummaryMoveOnlyController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { roles } = res.locals.user
      const { username } = req.user
      const arrival = await this.expectedArrivalsService.getArrival(username, id)
      const confirmArrivalEnabled = roles.includes(Role.PRISON_RECEPTION)
      return res.render('pages/bookedtoday/summaryMoveOnly.njk', { arrival, confirmArrivalEnabled })
    }
  }
}
