# Database

A common wrapper around MongoDB. Each collection is exposed as an injectable service with corresponding type definitions.

## Configuration

This package exposes the following injection tokens to configure connection to MongoDB:

-   `MONGODB_URL` - URL of a MongoDB instance
-   `MONGODB_DB` - MongoDB database name
-   `MONGODB_X509` - optional certificate for authentication, can be an empty string if authentication is not needed
