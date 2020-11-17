# PubSub

A common wrapper around Redis.

This package provides two main injectable services, `Publisher` and `Subscriber`. This package also defines channels and corresponding message types, ensurlng type safety of publish & subscribe operations. 

Under the hood, this package uses MessagePack to serialise messages from & to byte stream, since it allows for smaller serialised data and better handling of complex types than JSON. Subscriber emits messages as RxJS `Observable`, and only stays subscribed to Redis as long as there's acually someone listening for the emitted messages.

## Configuration

This package exposes two injection tokens to configure connection to Redis:

-   `REDIS_URL` - URL of a Redis instance, including database number
-   `REDIS_AUTH` - optional string for Redis authentication, can be an empty string if authentication is not needed
