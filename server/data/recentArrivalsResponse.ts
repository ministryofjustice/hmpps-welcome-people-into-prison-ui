import moment from 'moment'

const today = moment().format('YYYY-MM-DD')
const twoDaysAgo = moment().subtract(2, 'days').format('YYYY-MM-DD')

export default [
  {
    prisonNumber: 'G5155VP',
    dateOfBirth: '1966-04-05',
    firstName: 'Gideon',
    lastName: 'Herkimer',
    movementDateTime: `${twoDaysAgo}T07:08:00`,
    location: 'MDI-1-3-004',
  },
  {
    prisonNumber: 'A7925DY',
    dateOfBirth: '1997-05-06',
    firstName: 'Bob',
    lastName: 'Smith',
    movementDateTime: `${today}T14:15:27`,
    location: 'MDI-1-4-009',
  },
  {
    prisonNumber: 'A7895DD',
    dateOfBirth: '1996-04-16',
    firstName: 'Mark',
    lastName: 'Marks',
    movementDateTime: `${today}T14:14:27`,
    location: 'MDI-RECV',
  },
  {
    prisonNumber: 'A7925AA',
    dateOfBirth: '1997-05-06',
    firstName: 'Jimmy',
    lastName: 'Smith',
    movementDateTime: `${today}T14:13:27`,
    location: 'MDI-1-3-099',
  },
  {
    prisonNumber: 'A1884KL',
    dateOfBirth: '1997-05-06',
    firstName: 'Tim',
    lastName: 'Anon',
    movementDateTime: `${today}T18:15:28`,
    location: 'MDI-1-3-088',
  },
  {
    prisonNumber: 'A1234KL',
    dateOfBirth: '1997-05-06',
    firstName: 'Tony',
    lastName: 'Blyth',
    movementDateTime: `${today}T18:15:27`,
    location: 'MDI-1-3-008',
  },
  {
    prisonNumber: 'D7925DP',
    dateOfBirth: '1997-05-06',
    firstName: 'Sam',
    lastName: 'Smith',
    movementDateTime: `${today}T09:15:27`,
    location: 'MDI-1-7-003',
  },
]
