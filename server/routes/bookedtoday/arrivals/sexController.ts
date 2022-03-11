import type { RequestHandler } from 'express'
import { State } from './state'

export default class SexController {
  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params

      const data = State.newArrival.get(req)

      const sex = this.normaliseToNomisValue(data.sex)

      if (sex) {
        State.newArrival.update(req, res, { sex })
        return res.redirect(`/prisoners/${id}/imprisonment-status`)
      }

      return res.render('pages/bookedtoday/arrivals/sex.njk', {
        errors: req.flash('errors'),
        id,
        data,
      })
    }
  }

  public assignSex(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { sex } = req.body

      if (req.errors) {
        return res.redirect(`/prisoners/${id}/sex`)
      }

      State.newArrival.update(req, res, { sex })

      return res.redirect(`/prisoners/${id}/imprisonment-status`)
    }
  }

  private normaliseToNomisValue(value: string): string {
    if (['MALE', 'M'].includes(value?.toUpperCase())) return 'M'
    if (['FEMALE', 'F'].includes(value?.toUpperCase())) return 'F'
    return null
  }
}
