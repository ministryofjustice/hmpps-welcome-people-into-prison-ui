import { RequestHandler } from 'express'
import type { TemporaryAbsencesService } from '../../services'

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

      res.redirect(`/prisoners/${prisonNumber}/prisoner-returned`)
    }
  }
}
