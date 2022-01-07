import { RequestHandler } from 'express'
import TemporaryAbsencesService from '../services/temporaryAbsencesService'

export default class CheckTemporaryAbsenceController {
  public constructor(private readonly temporaryAbsencesService: TemporaryAbsencesService) {}

  public checkTemporaryAbsence(): RequestHandler {
    return async (req, res) => {
      const { activeCaseLoadId } = res.locals.user
      const { prisonNumber } = req.params
      const data = await this.temporaryAbsencesService.getTemporaryAbsence(activeCaseLoadId, prisonNumber)
      return res.render('pages/checkTemporaryAbsence.njk', { data })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params

      res.redirect(`/prisoners/${prisonNumber}/prisoner-returned`)
    }
  }
}
