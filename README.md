# Fake API Server

A stateless, in-memory fake API server for use in integration tests.

## Install & run

```bash
npm install
npm start                 # default port 1090
PORT=3000 npm start       # custom port
```

## Docker

The image is published to Docker Hub as [`reachfive/fake-api-server`](https://hub.docker.com/r/reachfive/fake-api-server).

```bash
docker run -p 1090:1090 reachfive/fake-api-server
```

### Environment variables

| Variable | Default | Description                |
|----------|---------|----------------------------|
| `PORT`   | `1090`  | Port the server listens on |

### Docker Compose

```yaml
services:
  fake-api:
    image: reachfive/fake-api-server
    ports:
      - "1090:1090"
```

## Endpoints

### Mock record & replay

Configure a canned response, point your app under test at the mock endpoint, then inspect what it sent.

#### Send a request

All common HTTP methods are accepted: `GET`, `POST`, `PATCH`, `PUT`, `DELETE`.

```
POST /mock/whatever-name-i-want/request?some=parameter

{
  "name": "Bruce Wayne",
  "affiliation": "Wayne Enterprises",
  "hobby": "Dressing like a bat"
}
```

By default you receive an empty `200` response.

#### Set up a response

```
POST /mock/whatever-name-i-want/response

{
  "status": 417,
  "payload": {
    "error_message": "Sorry Mr. Wayne, I'm just a teapot"
  },
  "headers": {
    "some-kind-of-header": "auie,ctsrnm"
  }
}
```

You can also POST an array of responses; the endpoint will cycle through them in order.

```
POST /mock/whatever-name-i-want/response

[
  { "status": 417, "payload": { "error_message": "Sorry Mr. Wayne, I'm just a teapot" } },
  { "status": 200, "payload": { "confirmation": true } }
]
```

#### Get stored requests

```
GET /mock/whatever-name-i-want
```

Query parameters:

- `method` — filter by HTTP method
- `since` — requests received after this time (ISO 8601 or epoch ms)
- `until` — requests received before this time (ISO 8601 or epoch ms)

Response:

```json
[
  {
    "query": { "some": "parameter" },
    "body": {
      "name": "Bruce Wayne",
      "affiliation": "Wayne Enterprises",
      "hobby": "Dressing like a bat"
    },
    "headers": {
      "content-type": "application/json"
    },
    "server_date": "2018-10-23T09:56:13.888Z",
    "endpoint_name": "whatever-name-i-want",
    "method": "POST"
  }
]
```

#### Get all stored requests

Returns a map of all endpoint names to their request arrays.

```
GET /mock/
```

---

### Twilio

#### Send a fake SMS

```
POST /twilio/messages

{
  "To": "+33606060606",
  "From": "+33101010101",
  "Body": "Your verification code is 123456"
}
```

#### Retrieve SMS

```
GET /twilio/messages
```

Query parameters:

- `from` — filter by sender
- `to` — filter by recipient
- `since` — filter by date (ISO 8601 or epoch ms)
- `until` — filter by date (ISO 8601 or epoch ms)

Response:

```json
[
  {
    "sid": "SM_abc123",
    "To": "+33606060606",
    "From": "+33101010101",
    "Body": "Your verification code is 123456",
    "date_created": "2018-10-23T09:56:13.888Z"
  }
]
```

---

### Version

```
GET /version/
```

Returns the server version from `package.json`.
