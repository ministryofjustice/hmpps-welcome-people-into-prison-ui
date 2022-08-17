import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../__testutils/appSetup'
import Role from '../../authentication/role'
import { createMockPrisonService, createMockNotificationService } from '../../services/__testutils/mocks'

let app: Express
const prisonService = createMockPrisonService()
const notificationService = createMockNotificationService()

const emailPersonalisation = {
  username: 'user1',
  prison: 'Moorland (HMP & YOI)',
  feedback: 'Some content',
  email: 'a.user@email',
}

describe('feedbackController', () => {
  beforeEach(() => {
    app = appWithAllRoutes({
      services: { notificationService, prisonService },
      roles: [Role.PRISON_RECEPTION],
    })

    prisonService.getPrison.mockResolvedValue({
      description: 'Moorland (HMP & YOI)',
    })
    flashProvider.mockReturnValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /feedback', () => {
    it('should render /feedback page', () => {
      return request(app)
        .get('/feedback')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Give feedback on Welcome people into prison')
        })
    })
  })

  describe('POST /feedback', () => {
    it('should redirect when validation error', () => {
      return request(app)
        .post('/feedback')
        .send({ email: 'a.user@email' })
        .expect(302)
        .expect('Location', '/feedback')
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', [{ href: '#feedback', text: 'Enter your feedback' }])
          expect(flashProvider).toHaveBeenCalledWith('input', { email: 'a.user@email' })
        })
    })

    it('should call service methods correctly', () => {
      return request(app)
        .post('/feedback')
        .send({ feedback: 'Some content', email: 'a.user@email' })
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect(res => {
          expect(prisonService.getPrison).toHaveBeenCalledWith('MDI')
          expect(notificationService.sendEmail).toHaveBeenCalledWith(emailPersonalisation)
        })
    })

    it('should send default text for email if no email provided', () => {
      return request(app)
        .post('/feedback')
        .send({ feedback: 'Some content' })
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect(res => {
          expect(notificationService.sendEmail).toHaveBeenCalledWith({
            ...emailPersonalisation,
            email: '(No email address provided)',
          })
        })
    })

    it('should redirect to /', () => {
      return request(app)
        .post('/feedback')
        .send({ feedback: 'Some content', email: 'a.user@email' })
        .expect(302)
        .expect('Location', '/')
    })
  })
})
