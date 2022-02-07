import type { RequestHandler } from 'express'
import { State } from './state'

export default class ChangeDateOfBirthController {
  public showChangeDateOfBirth(): RequestHandler {
    return async (req, res) => {
      const data = State.searchDetails.get(req)
      res.render('pages/bookedtoday/arrivals/searchForExistingRecord/changeDateOfBirth.njk', { data })
    }
  }

  public changeDateOfBirth(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { day, month, year } = req.body
      const data = State.searchDetails.get(req)
      // TODO build and validate
      State.searchDetails.set(res, { ...data, dateOfBirth: `${year}-${month}-${day}` })
      res.redirect(`/prisoners/${id}/search-for-existing-record`)
    }
  }
}
