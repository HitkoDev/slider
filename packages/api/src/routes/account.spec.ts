import { AccountModel, AccountRepository, ObjectID } from '@task/database'
import { Publisher } from '@task/pubsub'
import { Channel, MessageTypes } from '@task/pubsub/dist/messages'
import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import request from 'supertest'
import { anything, capture, instance, mock, when } from 'ts-mockito'
import { container } from 'tsyringe'
import { prepareMockApp } from '../testing/app'

// tslint:disable: no-unused-expression

const existingID = new ObjectID()
const nonexistingID = new ObjectID()
const inactiveID = new ObjectID()

@suite
export class AccountRoutes {

    static app: request.SuperTest<request.Test>
    PublisherMock: Publisher
    AccountRepositoryMock: AccountRepository

    static async before() {
        this.app = request((await prepareMockApp(container)).listen())
    }

    before() {
        container.clearInstances()
        this.PublisherMock = mock(Publisher)
        container.register(Publisher, { useValue: instance(this.PublisherMock) })

        this.AccountRepositoryMock = mock(AccountRepository)
        when(this.AccountRepositoryMock.findById(anything())).thenCall(id => {
            if (id.equals(existingID))
                return Promise.resolve(new AccountModel({
                    _id: existingID,
                    name: 'existing',
                    isActive: true
                }))
            if (id.equals(nonexistingID))
                return Promise.resolve(undefined)
            if (id.equals(inactiveID))
                return Promise.resolve(new AccountModel({
                    _id: inactiveID,
                    name: 'inactive',
                    isActive: false
                }))
        })
        container.register(AccountRepository, { useValue: instance(this.AccountRepositoryMock) })
    }

    @test
    async existingAccount() {
        const data = 'test'
        const response = await AccountRoutes.app
            .get(`/account/track/${existingID}?data=${data}`)
            .expect(200)
        expect(response.text).to.equal('Accepted')
        const [channel, message] = capture<Channel, MessageTypes[keyof MessageTypes]>(this.PublisherMock.publish).last()
        expect(channel).to.equal(Channel.Tracking)
        expect(message).to.deep.contain({
            accountId: existingID,
            data
        })
    }

    @test
    async nonexistingAccount() {
        const data = 'test'
        const response = await AccountRoutes.app
            .get(`/account/track/${nonexistingID}?data=${data}`)
            .expect(404)
        expect(response.text).to.equal('No such account')
    }

    @test
    async inactiveAccount() {
        const data = 'test'
        const response = await AccountRoutes.app
            .get(`/account/track/${inactiveID}?data=${data}`)
            .expect(403)
        expect(response.text).to.equal('Deactivated account')
    }

    @test
    async invalidID() {
        const data = 'test'
        const id = 'invalid'
        const response = await AccountRoutes.app
            .get(`/account/track/${id}?data=${data}`)
            .expect(400)
        expect(response.text).to.equal('Invaild ID')
    }

    @test
    async emptyID() {
        const response = await AccountRoutes.app
            .get(`/account/track/`)
            .expect(404)
        expect(response.text).to.equal('Not Found')
    }

    @test
    async allowedMethods() {
        await AccountRoutes.app
            .options('/account/track/id')
            .expect(200)
            .expect('allow', 'HEAD, GET')
    }
}
