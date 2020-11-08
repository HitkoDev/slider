import { createToken } from '@task/utils'
import convict from 'convict'

export const ConfigurationSchema = convict({
    env: {
        doc: 'The application environment.',
        format: ['production', 'development', 'testing'],
        default: 'development',
        env: 'NODE_ENV'
    },
    redis: {
        uri: {
            doc: 'Redis connection URI',
            format: '*',
            default: 'redis://localhost:6379/6',
            env: 'REDIS_URI'
        },
        auth: {
            doc: 'Redis auth string',
            format: '*',
            default: '',
            env: 'REDIS_AUTH'
        }
    }
})

export type Configuration = ReturnType<
    typeof ConfigurationSchema.getProperties
>

export const CONFIG = createToken({
    provider: { useFactory: () => ConfigurationSchema.getProperties() },
    name: 'CONFIG'
})
