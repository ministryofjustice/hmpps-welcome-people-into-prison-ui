import { RequestHandler } from 'express'
import { Gender } from 'welcome'
import type ExpectedArrivalsService from '../services/expectedArrivalsService'
import type ImprisonmentStatusesService from '../services/imprisonmentStatusesService'
import raiseAnalyticsEvent from '../raiseAnalyticsEvent'
import { getImprisonmentStatus, getSex } from './state'

export default class CheckAnswersController {
  public constructor(
    private readonly expectedArrivalsService: ExpectedArrivalsService,
    private readonly imprisonmentStatusesService: ImprisonmentStatusesService
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const statusAndReason = getImprisonmentStatus(req)
      const sex = getSex(req)
      const moveData = await this.expectedArrivalsService.getArrival(id)
      const reasonImprisonment = await this.imprisonmentStatusesService.getReasonForImprisonment(statusAndReason)
      const data = { sex, reasonImprisonment, ...moveData }
      return res.render('pages/checkAnswers.njk', { data })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res, next) => {
      const { id } = req.params
      const { username, activeCaseLoadId } = res.locals.user
      const data = await this.expectedArrivalsService.getArrival(id)
      const statusAndReason = getImprisonmentStatus(req)
      const sex = getSex(req) as Gender
      const newOffender = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: sex,
        prisonId: activeCaseLoadId,
        imprisonmentStatus: statusAndReason.imprisonmentStatus,
        movementReasonCode: statusAndReason.movementReasonCode,
      }
      let offenderNumber

      try {
        offenderNumber = await this.expectedArrivalsService.createOffenderRecordAndBooking(username, id, newOffender)
      } catch (error) {
        if (error.status >= 400 && error.status < 500) {
          return res.redirect('/feature-not-available')
        }
        return next(error)
      }

      raiseAnalyticsEvent(
        'Add to the establishment roll',
        'Confirmed arrival',
        `AgencyId: ${activeCaseLoadId}, From: ${data.fromLocation}, Type: ${data.fromLocationType},`,
        req.hostname
      )

      req.flash('offenderNumber', offenderNumber.offenderNo)
      return res.redirect(`/prisoners/${id}/confirmation`)
    }
  }
}
