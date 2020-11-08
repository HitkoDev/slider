import { ObjectID } from '@task/database'
import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { decodeMessage, encodeMessage } from '../utils/encoder'

// tslint:disable: no-unused-expression

@suite
export class EncoderUtil {

    @test
    encodeDecode() {
        const message = {
            foo: 'bar',
            test: 1,
            missing: null
        }

        const decoded = decodeMessage(encodeMessage(message))
        expect(decoded).to.deep.equal(message)
    }

    @test
    encodeDecodeCustomTypes() {
        const message = {
            id: new ObjectID(),
            date: new Date()
        }

        const decoded = decodeMessage(encodeMessage(message)) as typeof message
        expect(decoded.id).to.be.instanceOf(ObjectID)
        expect(decoded.id.toHexString()).to.equal(message.id.toHexString())
        expect(decoded.date).to.be.instanceOf(Date)
        expect(decoded.date.getTime()).to.equal(message.date.getTime())
    }

}
