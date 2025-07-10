import type { RequestHandler } from 'express'
import type { PrisonService } from '../../../services'

export default class ConfirmTransferAddedToRollController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const activeCaseLoadId = res.locals.user.activeCaseload.id
      const { systemToken } = req.session
      const { firstName, lastName, location } = (req.flash('prisoner')?.[0] as Record<string, string>) || {}

      if (!firstName || !lastName || !location) {
        return res.redirect('/page-not-found')
      }

      const prison = await this.prisonService.getPrison(systemToken, activeCaseLoadId)

      return res.render('pages/bookedtoday/transfers/confirmTransferAddedToRoll.njk', {
        firstName,
        lastName,
        prisonNumber,
        prison,
        location,
      })
    }
  }
}
