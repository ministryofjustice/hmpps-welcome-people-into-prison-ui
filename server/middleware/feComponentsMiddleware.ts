import type { RequestHandler } from 'express'
import logger from '../../logger'
import { FeComponentsService } from '../services'

export default function getFrontendComponents(feComponentsService: FeComponentsService): RequestHandler {
  return async (req, res, next) => {
    try {
      const { header, footer } = await feComponentsService.getFeComponents(['header', 'footer'], res.locals.user.token)

      res.locals.feComponents = {
        header: header.html,
        footer: footer.html,
        cssIncludes: [...header.css, ...footer.css],
        jsIncludes: [...header.javascript, ...footer.javascript],
      }
      return next()
    } catch (error) {
      logger.error(error, 'Failed to retrieve front end components')
      return next()
    }
  }
}
