import { ObjectID } from '@task/database'

export enum Channel {
    Tracking = 'tracking'
}

export interface TrackingMessage {
    accountId: ObjectID
    timestamp: Date
    data: string
}

export interface MessageTypes {
    [Channel.Tracking]: TrackingMessage
}
