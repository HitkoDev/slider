import { container, FactoryProvider, InjectionToken, isFactoryProvider, isValueProvider, ValueProvider } from 'tsyringe'

export function createToken<T>(args?: {
    name?: string
    provider?: ValueProvider<T> | FactoryProvider<T>
}): InjectionToken<T> {
    const { name, provider } = args || {}
    const token = Symbol(name)

    if (provider) {
        if (isValueProvider(provider))
            container.register(token, provider)

        if (isFactoryProvider(provider))
            container.register(token, provider)
    }

    return token
}
