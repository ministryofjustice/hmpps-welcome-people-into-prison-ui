import { RequestHandler } from 'express'
import type { PrisonService } from '../../../../services'
import { State } from '../state'

export default class ConfirmAddedToRollController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const flashMessage = req.flash('arrivalResponse')?.[0]

      if (typeof flashMessage !== 'string') return res.redirect('/page-not-found')

      let arrivalData: Record<string, string> | null = null

      try {
        arrivalData = JSON.parse(flashMessage)
      } catch {
        return res.redirect('/page-not-found')
      }

      const { firstName, lastName, prisonNumber, location } = arrivalData

      if (!firstName || !lastName || !prisonNumber || !location) {
        return res.redirect('/page-not-found')
      }

      const { systemToken } = req.session
      const activeCaseLoadId = res.locals.user.activeCaseload.id
      const prison = await this.prisonService.getPrison(systemToken, activeCaseLoadId)
      State.newArrival.clear(res)
      return res.render('pages/bookedtoday/arrivals/confirmArrival/confirmAddedToRoll.njk', {
        firstName,
        lastName,
        prison,
        prisonNumber,
        location,
      })
    }
  }
}
