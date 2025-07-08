import { RequestHandler } from 'express'
import type { PrisonService } from '../../../../services'
import { State } from '../state'
import editProfileEnabled from '../../../../utils/featureToggles'

export default class ConfirmAddedToRollController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { firstName, lastName, prisonNumber, location } =
        (req.flash('arrivalResponse')?.[0] as Record<string, string>) || {}
      if (!firstName || !lastName || !prisonNumber || !location) {
        return res.redirect('/page-not-found')
      }
      const { activeCaseLoadId } = res.locals.user
      const prison = await this.prisonService.getPrison(activeCaseLoadId)
      State.newArrival.clear(res)

      return res.render('pages/bookedtoday/arrivals/confirmArrival/confirmAddedToRoll.njk', {
        firstName,
        lastName,
        prison,
        prisonNumber,
        location,
        editEnabled: editProfileEnabled(activeCaseLoadId),
      })
    }
  }
}
