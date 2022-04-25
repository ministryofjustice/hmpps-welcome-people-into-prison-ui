import moment from 'moment'

interface Person {
  firstName: string
  lastName: string
}

const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const groupBy = <T, K>(items: T[], groupingFunction: (item: T) => K): Map<K, T[]> => {
  return items.reduce((result, item) => {
    const key = groupingFunction(item)
    const currentValues = result.get(key) || []
    currentValues.push(item)
    result.set(key, currentValues)
    return result
  }, new Map<K, T[]>())
}

export const compareByFullName = <T extends Person>(a: T, b: T): number => {
  const result = a.lastName.localeCompare(b.lastName)
  return result !== 0 ? result : a.firstName.localeCompare(b.firstName)
}

export function assertHasStringValues<K extends keyof Record<string, unknown>>(
  obj: Record<string, unknown>,
  keysToCheck: K[]
): asserts obj is Record<K, string> {
  const matches = obj && typeof obj === 'object'

  if (!matches) {
    throw Error('Not a record')
  }
  const invalidKeys = keysToCheck.filter(k => typeof obj[k] !== 'string')
  if (invalidKeys.length) {
    throw Error(`Missing or invalid keys: ${invalidKeys}`)
  }
}

export function assertHasOptionalStringValues<K extends string>(
  obj: unknown,
  keysToCheck: K[]
): asserts obj is Record<K, string | undefined> {
  const matches = obj && typeof obj === 'object'

  if (!matches) {
    throw Error('Not a record')
  }
  const invalidKeys = keysToCheck.filter(k => obj[k as string] && typeof obj[k as string] !== 'string')
  if (invalidKeys.length) {
    throw Error(`Non string keys: ${invalidKeys}`)
  }
}

export function trimObjectValues(obj: unknown): Record<string, string> {
  const isObject = obj && typeof obj === 'object'

  if (!isObject) {
    throw Error('Not a record')
  }

  if (Object.values(obj).some(s => typeof s !== 'string' && s !== undefined)) {
    throw Error('Values present not all strings')
  }
  return Object.keys(obj).reduce((acc, curr) => {
    acc[curr] = obj[curr].trim()
    return acc
  }, {})
}

export const createDate = (day: string, month: string, year: string) =>
  `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

export const zip = <A, B>(a: A[], b: B[]): [A, B][] => a.map((k, i) => [k, b[i]])

export const isValidDate = (day: string, month: string, year: string) => {
  const validate = (d: unknown, m: unknown, y: unknown) => {
    const fullDate = createDate(d.toString(), m.toString(), y.toString())
    return moment(fullDate, 'YYYY-MM-DD', true).isValid()
  }

  return !day || !month || !year || validate(day, month, year)
}
