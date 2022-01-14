import { RequestHandler } from 'express'
import type { TemporaryAbsencesService } from '../../services'
import raiseAnalyticsEvent from '../../raiseAnalyticsEvent'

export default class CheckTemporaryAbsenceController {
  public constructor(private readonly temporaryAbsencesService: TemporaryAbsencesService) {}

  public checkTemporaryAbsence(): RequestHandler {
    return async (req, res) => {
      const { activeCaseLoadId } = res.locals.user
      const { prisonNumber } = req.params
      const data = await this.temporaryAbsencesService.getTemporaryAbsence(activeCaseLoadId, prisonNumber)
      return res.render('pages/temporaryabsences/checkTemporaryAbsence.njk', { data })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const { username } = req.user
      const { activeCaseLoadId } = res.locals.user
      const data = await this.temporaryAbsencesService.getTemporaryAbsence(activeCaseLoadId, prisonNumber)

      await this.temporaryAbsencesService.confirmTemporaryAbsence(username, prisonNumber, {
        agencyId: activeCaseLoadId,
      })

      req.flash('prisoner', {
        firstName: data.firstName,
        lastName: data.lastName,
      })

      raiseAnalyticsEvent(
        'Add to the establishment roll',
        'Confirmed temporary absence returned',
        `AgencyId: ${activeCaseLoadId}, Reason: ${data.reasonForAbsence}, Type: 'PRISON',`,
        req.hostname
      )

      res.redirect(`/prisoners/${prisonNumber}/prisoner-returned`)
    }
  }
}
