import type { RequestHandler } from 'express'
import { State } from '../../state'

export default class ChangePncNumberController {
  public showChangePncNumber(): RequestHandler {
    return async (req, res) => {
      const data = State.searchDetails.get(req)
      res.render('pages/bookedtoday/arrivals/searchforexisting/search/changePncNumber.njk', { data })
    }
  }

  public changePncNumber(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { pncNumber } = req.body
      State.searchDetails.update(req, res, { pncNumber })
      res.redirect(`/prisoners/${id}/search-for-existing-record`)
    }
  }

  public removePncNumber(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      State.searchDetails.update(req, res, { pncNumber: undefined })
      res.redirect(`/prisoners/${id}/search-for-existing-record`)
    }
  }
}
