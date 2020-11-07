import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { promises } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { promisify } from 'util'
import { brotliCompress } from 'zlib'
import { loadAuthCertificate } from './auth'

const pbrotliCompress = promisify(brotliCompress)

// tslint:disable: no-unused-expression

@suite
export class AuthUtils {

    @test
    async loadNoCertificate() {
        const loaded = await loadAuthCertificate()
        expect(loaded).to.be.undefined
    }

    @test
    async loadEncodedCertificate() {
        const value = Buffer.from('test')
        const encoded = (await pbrotliCompress(value)).toString('base64')

        const loaded = await loadAuthCertificate(encoded)
        expect(loaded).to.exist
        expect(loaded?.toString()).to.equal(value.toString())
    }

    @test
    async loadBrokenCertificate() {
        const value = '/srv/test/1234567890abcdefghijklmnopABCDEFGHIJKLMNOP.pem'

        try {
            await loadAuthCertificate(value)
            expect.fail('Should error on broken input')
        } catch (e) {
            expect(e.message).to.equal(`Unrecognised certificate '${value.substr(0, 50)}...'`)
        }
    }

    @test
    async loadCertificateFromFile() {
        const file = path.join(tmpdir(), `test-${Math.random().toFixed(10).substr(2)}.pem`)
        const value = Buffer.from('test')
        await promises.writeFile(file, value)

        const loaded = await loadAuthCertificate(file)
        expect(loaded).to.exist
        expect(loaded?.toString()).to.equal(value.toString())

        // Cleanup
        await promises.unlink(file)
    }
}
