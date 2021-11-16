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
