import { RequestHandler } from 'express'
import type { RaiseAnalyticsEvent, TemporaryAbsencesService } from '../../services'

export default class CheckTemporaryAbsenceController {
  public constructor(
    private readonly temporaryAbsencesService: TemporaryAbsencesService,
    private readonly raiseAnalyticsEvent: RaiseAnalyticsEvent,
  ) {}

  public checkTemporaryAbsence(): RequestHandler {
    return async (req, res) => {
      const { arrivalId } = req.query
      const { prisonNumber } = req.params
      const data = await this.temporaryAbsencesService.getTemporaryAbsence(prisonNumber)
      return res.render('pages/temporaryabsences/checkTemporaryAbsence.njk', { data, arrivalId })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const { username } = req.user
      const { arrivalId } = req.body
      const { activeCaseLoadId } = res.locals.user
      const data = await this.temporaryAbsencesService.getTemporaryAbsence(prisonNumber)

      const arrivalResponse = await this.temporaryAbsencesService.confirmTemporaryAbsence(
        username,
        prisonNumber,
        activeCaseLoadId,
        arrivalId,
      )

      if (!arrivalResponse) {
        return res.redirect('/feature-not-available')
      }

      req.flash('prisoner', {
        firstName: data.firstName,
        lastName: data.lastName,
        location: arrivalResponse.location,
      })

      this.raiseAnalyticsEvent(
        'Add to the establishment roll',
        'Confirmed temporary absence returned',
        `AgencyId: ${activeCaseLoadId}, Reason: ${data.reasonForAbsence}, Type: 'PRISON',`,
      )

      return res.redirect(`/prisoners/${prisonNumber}/prisoner-returned`)
    }
  }
}
