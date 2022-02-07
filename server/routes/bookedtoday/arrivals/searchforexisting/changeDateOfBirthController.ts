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
      // TODO build and validate
      State.searchDetails.update(req, res, { dateOfBirth: `${year}-${month}-${day}` })

      res.redirect(`/prisoners/${id}/search-for-existing-record`)
    }
  }
}
