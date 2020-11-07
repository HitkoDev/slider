import { container, FactoryProvider, InjectionToken, isFactoryProvider, isValueProvider, ValueProvider } from 'tsyringe'

export function createToken<T>(provider: ValueProvider<T> | FactoryProvider<T>, name?: string): InjectionToken<T> {
    const token = Symbol(name)

    if (isValueProvider(provider))
        container.register(token, provider)

    if (isFactoryProvider(provider))
        container.register(token, provider)

    return token
}
