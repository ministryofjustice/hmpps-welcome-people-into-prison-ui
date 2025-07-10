import { RequestHandler } from 'express'
import type { PrisonService } from '../../services'

export default class ConfirmTemporaryAbsenceAddedToRollController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const activeCaseLoadId = res.locals.user.activeCaseload.id
      const { systemToken } = req.session
      const flashItem = req.flash('prisoner')?.[0]

      const { firstName, lastName, location } = flashItem
        ? (JSON.parse(flashItem as unknown as string) as Record<string, string>)
        : {}

      const prison = await this.prisonService.getPrison(systemToken, activeCaseLoadId)

      if (!firstName || !lastName || !location) {
        return res.redirect('/page-not-found')
      }

      return res.render('pages/temporaryabsences/confirmTemporaryAbsenceAddedToRoll.njk', {
        firstName,
        lastName,
        prisonNumber,
        prison,
        location,
      })
    }
  }
}
