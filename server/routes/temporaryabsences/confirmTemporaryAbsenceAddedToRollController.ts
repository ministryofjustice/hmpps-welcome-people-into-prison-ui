import { RequestHandler } from 'express'
import type { PrisonService } from '../../services'

export default class ConfirmTemporaryAbsenceAddedToRollController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const { activeCaseLoadId } = res.locals.user
      const { firstName, lastName } = req.flash('prisoner')?.[0] as Record<string, string>

      const prison = await this.prisonService.getPrison(activeCaseLoadId)

      if (!firstName || !lastName || !prisonNumber || !prison) {
        return res.redirect('/prisoners-returning')
      }

      return res.render('pages/temporaryabsences/confirmTemporaryAbsenceAddedToRoll.njk', {
        firstName,
        lastName,
        prisonNumber,
        prison,
      })
    }
  }
}
