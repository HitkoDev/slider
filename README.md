# Task

## Setup

Start services:

```sh
docker stack deploy -c docker-compose.yml services
```

Install dependencies:

```sh
yarn
```

Build common packages for backend:

```sh
yarn build
```

## Slider

```sh
yarn workspace @task/slider start:dev
```

Demo will start at <http://localhost:5080/>

## API

```sh
yarn workspace @task/api start
```

Generate sample accounts on start:

```sh
yarn workspace @task/api start --sample
```

API is listening for tasks at <http://localhost:8080/account/track/[:id]?data=[:message]>

## CLI

```sh
yarn workspace @task/cli cli listen
```

Filter by account ids:

```sh
yarn workspace @task/cli cli listen -f id [-f id2 ...] 
```

# Services

If MongoDB or Redis require authentication or use custom ports, you can create a config file and pass it to API & CLI via the `-c` parameter:

```json
{
    "redis": {
        "url": "redis://localhost:6379/6",
        "auth": ""
    },
    "mongodb": {
        "url": "mongodb://localhost:27017",
        "db": "task",
        "x509": "/path/to/file.pem"
    }
}
```

# See also

For further explanation about each package, see `README.md` files of each package.
