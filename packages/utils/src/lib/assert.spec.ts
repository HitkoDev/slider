import { suite, test } from '@testdeck/mocha'
import { AssertionError } from 'assert'
import { expect } from 'chai'
import { assertIsDefined, isDefined } from './assert'

// tslint:disable: no-unused-expression

@suite
export class AssertLib {

    @test
    public async isDefined() {
        expect(isDefined(undefined)).to.equal(false)
        expect(isDefined(null)).to.equal(false)
        expect(isDefined(false)).to.equal(true)
        expect(isDefined(0)).to.equal(true)
        expect(isDefined('')).to.equal(true)
        expect(isDefined([])).to.equal(true)
    }

    @test
    public async assertIsDefined() {
        const failMessage = 'Value is not defined'
        try {
            assertIsDefined(undefined, failMessage)
            expect.fail('should throw on undefined')
        } catch (e) {
            expect(e).to.be.instanceOf(AssertionError)
            expect(e.message).to.equal(failMessage)
        }

        try {
            assertIsDefined(null, failMessage)
            expect.fail('should throw on undefined')
        } catch (e) {
            expect(e).to.be.instanceOf(AssertionError)
            expect(e.message).to.equal(failMessage)
        }

        assertIsDefined(false)
        assertIsDefined(0)
        assertIsDefined('')
        assertIsDefined([])
    }
}
