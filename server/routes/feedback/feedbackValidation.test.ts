import FeedbackValidator from './feedbackValidation'

describe('FeedbackValidator', () => {
  it('Feedback required', () =>
    expect(FeedbackValidator({ email: 'a.user@email' })).toEqual([
      {
        href: '#feedback',
        text: 'Enter your feedback',
      },
    ]))

  it('Email address optional', () =>
    expect(FeedbackValidator({})).toEqual([
      {
        href: '#feedback',
        text: 'Enter your feedback',
      },
    ]))

  it('Valid input', () => expect(FeedbackValidator({ feedback: 'Some content', email: 'a.user@email' })).toEqual([]))

  test.each([
    ['Abc.example.com'],
    ['A@b@c@example.com'],
    ['a"b(c)d,e:f;g<h>i[jk]l@example.com'],
    ['just"not"right@example.com'],
    ['this is"notallowed@example.com '],
    ['this still"notallowed@example.com'],
  ])('invalid email addresses : (%s)', email => {
    expect(FeedbackValidator({ feedback: 'Some content', email })).toEqual([
      {
        href: '#email',
        text: 'Enter an email address in the correct format, like name@example.com',
      },
    ])
  })
})
