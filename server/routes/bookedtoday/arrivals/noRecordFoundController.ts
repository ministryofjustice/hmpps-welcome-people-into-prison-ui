import type { RequestHandler } from 'express'
import { State } from './state'

export default class NoRecordFoundController {
  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const data = State.newArrival.get(req)
      return res.render('pages/bookedtoday/arrivals/noMatchFound.njk', { id, data })
    }
  }
}
