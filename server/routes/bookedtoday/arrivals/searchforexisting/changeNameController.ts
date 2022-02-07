import type { RequestHandler } from 'express'
import { State } from './state'

export default class ChangeNameController {
  public showChangeName(): RequestHandler {
    return async (req, res) => {
      const data = State.searchDetails.get(req)
      res.render('pages/bookedtoday/arrivals/searchForExistingRecord/changeName.njk', { data })
    }
  }

  public changeName(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { firstName, lastName } = req.body
      State.searchDetails.update(req, res, { firstName, lastName })
      res.redirect(`/prisoners/${id}/search-for-existing-record`)
    }
  }
}
