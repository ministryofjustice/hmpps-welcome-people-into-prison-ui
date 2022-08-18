import { Router } from 'express'
import type { Services } from '../../services'
import FeedbackFormController from './feedbackFormController'
import FeedbackConfirmationController from './feedbackConfirmationController'
import Routes from '../../utils/routeBuilder'
import validationMiddleware from '../../middleware/validationMiddleware'
import FeedbackValidator from './feedbackValidation'

export default function routes(services: Services): Router {
  const feedbackForm = new FeedbackFormController(services.notificationService, services.prisonService)
  const feedbackConfirmation = new FeedbackConfirmationController()

  return Routes.forAnyRole()
    .get('/feedback', feedbackForm.view())
    .post('/feedback', validationMiddleware(FeedbackValidator), feedbackForm.submit())

    .get('/feedback-submitted', feedbackConfirmation.view())

    .build()
}
