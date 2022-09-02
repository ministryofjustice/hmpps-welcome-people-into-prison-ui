import type { RequestHandler } from 'express'

export default class StartConfirmationController {
  public redirect(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      return res.redirect(`/prisoners/${id}/sex`)
    }
  }
}
