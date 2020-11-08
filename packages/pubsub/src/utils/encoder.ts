import { decode, encode, ExtensionCodec } from '@msgpack/msgpack'
import { ObjectID } from '@task/database'

export enum ExtendedTypes {
    ObjectID = 0
}

export const extendedCodec = new ExtensionCodec()

extendedCodec.register({
    type: ExtendedTypes.ObjectID,
    encode(value) {
        if (value instanceof ObjectID)
            return encode(value.toHexString())
        else
            return null
    },
    decode(encoded) {
        const data = decode(encoded) as string
        return new ObjectID(data)
    }
})

export function encodeMessage(message: object) {
    const data = encode(message, { extensionCodec: extendedCodec })
    return Buffer.from(data).toString('base64')
}

export function decodeMessage(message: string) {
    const data = Buffer.from(message, 'base64')
    return decode(data, { extensionCodec: extendedCodec })
}
