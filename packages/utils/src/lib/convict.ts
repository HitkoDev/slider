import { Config } from 'convict'
import { readFile } from 'fs/promises'

/**
 * Recursively remove redundant propertied from file
 */
function pick(schema: { [key: string]: any }, config: { [key: string]: any } | undefined) {
    const data: { [key: string]: any } = {}
    Object.keys(schema)
        .forEach((key) => {
            let val = schema[key]
            if (typeof val === 'object' && !Array.isArray(val) && val != null) {
                if ('_cvtProperties' in val) {
                    val = val._cvtProperties
                } else {
                    if (config && key in config)
                        data[key] = config[key]
                    return
                }
                const sub = pick(val, config && config[key])
                if (sub !== undefined)
                    data[key] = sub
            }
        })

    if (Object.keys(data).length > 0)
        return data
}

/**
 * Clean input data by removing keys not defined in config schema
 *
 * @param dirty Data to be loaded
 * @param config Config object
 */
export function cleanConfig<T>(dirty: { [key: string]: any } | undefined, config: Config<T>) {
    // @ts-ignore
    const data = pick(config.getSchema()._cvtProperties, dirty)
    return data || {}
}

/**
 * Safely load config from file by first removing redundant values
 */
export async function loadConfigFile<T>(path: string, config: Config<T>) {
    const imp = JSON.parse(await readFile(path, 'utf8'))
    const data = cleanConfig(imp, config)
    config.load(data)
    return config
}
