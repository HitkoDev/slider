import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { container, DependencyContainer } from 'tsyringe'
import { createToken } from './token'

// tslint:disable: no-unused-expression

@suite
export class TokenLib {

    childContainer: DependencyContainer

    before() {
        this.childContainer = container.createChildContainer()
    }

    @test
    public async createToken() {
        const tokenName = 'TEST_TOKEN'

        const token = createToken({ name: tokenName })

        expect(typeof token).to.equal('symbol')
        expect(token.toString()).to.equal(`Symbol(${tokenName})`)
    }

    @test
    public async createValueToken() {
        const value = 'test'

        const token = createToken({ provider: { useValue: value } })

        expect(this.childContainer.resolve(token)).to.equal(value)
    }

    @test
    public async createFactoryToken() {
        const value = 'test'

        const token = createToken({ provider: { useFactory: () => value } })

        expect(this.childContainer.resolve(token)).to.equal(value)
    }
}
