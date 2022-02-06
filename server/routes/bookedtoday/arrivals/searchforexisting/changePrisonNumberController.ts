import type { RequestHandler } from 'express'
import { State } from './state'

export default class ChangePrisonNumberController {
  public showChangePrisonNumber(): RequestHandler {
    return async (req, res) => {
      const data = State.searchDetails.get(req)
      res.render('pages/bookedtoday/arrivals/searchForExistingRecord/changePrisonNumber.njk', { data })
    }
  }

  public changePrisonNumber(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { prisonNumber } = req.body
      const data = State.searchDetails.get(req)
      State.searchDetails.set(res, { ...data, prisonNumber })
      res.redirect(`/prisoners/${id}/search-for-existing-record`)
    }
  }
}
