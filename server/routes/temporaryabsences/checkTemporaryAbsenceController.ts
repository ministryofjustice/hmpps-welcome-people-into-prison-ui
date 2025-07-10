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
      const { systemToken } = req.session
      const data = await this.temporaryAbsencesService.getTemporaryAbsence(systemToken, prisonNumber)
      return res.render('pages/temporaryabsences/checkTemporaryAbsence.njk', { data, arrivalId })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const { arrivalId } = req.body
      const { systemToken } = req.session
      const activeCaseLoadId = res.locals.user.activeCaseload.id

      try {
        const data = await this.temporaryAbsencesService.getTemporaryAbsence(systemToken, prisonNumber)

        const arrivalResponse = await this.temporaryAbsencesService.confirmTemporaryAbsence(
          systemToken,
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
      } catch (error) {
        if (error.status >= 400 && error.status < 500) {
          return null
        }
        throw error
      }
    }
  }
}
