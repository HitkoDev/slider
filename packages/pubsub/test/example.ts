import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'

// tslint:disable: no-unused-expression

@suite
export class ExampleUnitTest {

    @test('should write a test here')
    public async exampleTest() {
        expect(true).to.be.true
    }
}
