import { AssertionError } from 'assert'

export function assertIsDefined<T>(
    val: T,
    message?: string
): asserts val is NonNullable<T> {
    if (val === undefined || val === null) {
        throw new AssertionError({
            message: message ?? `Expected value to be defined, but received '${val}'!`
        })
    }
}

export function isDefined<T>(val: T): val is NonNullable<T> {
    return val !== undefined && val !== null
}
