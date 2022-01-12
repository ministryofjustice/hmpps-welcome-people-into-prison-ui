import type { RequestHandler } from 'express'
import type { PrisonService } from '../../../services'

export default class ConfirmTransferAddedToRollController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const { activeCaseLoadId } = res.locals.user
      const { firstName, lastName } = req.flash('prisoner')?.[0] as Record<string, string>

      if (!firstName && !lastName) {
        return res.redirect('/confirm-arrival/choose-prisoner')
      }

      const prison = await this.prisonService.getPrison(activeCaseLoadId)

      return res.render('pages/bookedtoday/transfers/confirmTransferAddedToRoll.njk', {
        firstName,
        lastName,
        prisonNumber,
        prison,
      })
    }
  }
}
