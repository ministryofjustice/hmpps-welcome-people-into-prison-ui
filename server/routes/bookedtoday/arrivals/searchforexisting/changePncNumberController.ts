import type { RequestHandler } from 'express'
import { State } from './state'

export default class ChangePncNumberController {
  public showChangePncNumber(): RequestHandler {
    return async (req, res) => {
      const data = State.searchDetails.get(req)
      res.render('pages/bookedtoday/arrivals/searchForExistingRecord/changePncNumber.njk', { data })
    }
  }

  public changePncNumber(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { pncNumber } = req.body
      const data = State.searchDetails.get(req)
      State.searchDetails.set(res, { ...data, pncNumber })
      res.redirect(`/prisoners/${id}/search-for-existing-record`)
    }
  }

  public removePncNumber(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const data = State.searchDetails.get(req)
      State.searchDetails.set(res, { ...data, pncNumber: undefined })
      res.redirect(`/prisoners/${id}/search-for-existing-record`)
    }
  }
}
