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
        url: {
            doc: 'Redis connection URL',
            format: '*',
            default: 'redis://localhost:6379/6',
            env: 'REDIS_URL'
        },
        auth: {
            doc: 'Redis auth string',
            format: '*',
            default: '',
            env: 'REDIS_AUTH'
        }
    },
    mongodb: {
        url: {
            doc: 'Mongo connection URL',
            format: '*',
            default: 'mongodb://localhost:27017',
            env: 'MONGODB_URL'
        },
        db: {
            doc: 'Mongo database name to use',
            format: '*',
            default: 'task',
            env: 'MONGODB_DB'
        },
        x509: {
            doc: 'Mongo certificate to use for authentication',
            format: '*',
            default: '',
            env: 'MONGODB_CERTIFICATE',
            sensitive: true
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
