import moment from 'moment'

const fromDate = moment().subtract(2, 'days').format('YYYY-MM-DD')
const toDate = moment().format('YYYY-MM-DD')

export default {
  arrivals: ({
    content = [
      {
        firstName: 'Jim',
        lastName: 'Smith',
        dateOfBirth: '1973-01-08',
        prisonNumber: 'A1234AB',
        movementDateTime: `${fromDate}T13:16:00`,
        location: 'MDI-1-5-119',
      },
      {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1973-01-01',
        prisonNumber: 'G0015GF',
        movementDateTime: `${toDate}T14:40:01`,
        location: 'MDI-1-3-004',
      },
    ],
    pageable = {
      sort: { empty: true, sorted: false, unsorted: true },
      offset: 0,
      pageSize: 50,
      pageNumber: 0,
      paged: true,
      unpaged: false,
    },
    last = true,
    totalPages = 0,
    totalElements = 0,
    size = 50,
    number = 0,
    sort = { empty: true, sorted: false, unsorted: true },
    first = true,
    numberOfElements = 0,
    empty = true,
  }) => ({
    content,
    pageable,
    last,
    totalPages,
    totalElements,
    size,
    number,
    sort,
    first,
    numberOfElements,
    empty,
  }),
}
