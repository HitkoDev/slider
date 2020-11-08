import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import convict from 'convict'
import { cleanConfig } from './convict'

// tslint:disable: no-unused-expression

const Schema = convict({
    foo: {
        bar: {
            format: '*',
            default: ''
        },
        baz: {
            format: '*',
            default: ''
        }
    }
})

@suite
export class ConvictLib {

    @test
    public async cleanInput() {
        const dirty = {
            foo: {
                bar: 'bar',
                baz: 'baz'
            }
        }

        const clean = cleanConfig(dirty, Schema)
        expect(clean).to.deep.equal(dirty)
    }

    @test
    public async removeExtraProperties() {
        const dirty = {
            foo: {
                bar: 'bar',
                baz: 'baz',
                e1: 'unused'
            },
            e2: 'unused'
        }

        const clean = cleanConfig(dirty, Schema)
        expect(clean).to.deep.equal({
            foo: {
                bar: 'bar',
                baz: 'baz'
            }
        })
    }

    @test
    public async allExtraProperties() {
        const dirty = {
            foo: {
                e1: 'unused'
            },
            e2: 'unused'
        }

        const clean = cleanConfig(dirty, Schema)
        expect(clean).to.deep.equal({})
    }
}
