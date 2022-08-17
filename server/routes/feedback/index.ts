import { Router } from 'express'
import type { Services } from '../../services'
import FeedbackFormController from './feedbackFormController'
import Routes from '../../utils/routeBuilder'
import validationMiddleware from '../../middleware/validationMiddleware'
import FeedbackValidator from './feedbackValidation'

export default function routes(services: Services): Router {
  const feedbackForm = new FeedbackFormController(services.notificationService, services.prisonService)

  return Routes.forAnyRole()
    .get('/feedback', feedbackForm.view())
    .post('/feedback', validationMiddleware(FeedbackValidator), feedbackForm.submit())

    .build()
}
