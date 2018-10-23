# Fake API Server


## Install dependencies
npm install

## Start development live-reload server
PORT=1090 npm run dev

## Start production server:
PORT=1090 npm start

## Endpoints

### Basic Mock

The basic mock allows you to send a request to an arbitrary named endpoint, then checked what was received.
You can also specify in advance what the response should be.

#### Send a request

All frequent HTTP methods are possible: GET, POST, PATCH, PUT, DELETE. Use them on `/request` under whatever name you want.

```
POST /mock/whatever-name-i-want/request?some=parameter

{
  "name": "Bruce Wayne",
  "affiliation": "Wayne Enterprises",
  "hobby": "Dressing like a bat"
}
```

By default, you will receive an empty 200 response.

#### Setup a response

To set the response your call should receive, send them on `/response` under whatever name you want.
The body is a JSON with three optional fields describing what response should be sent.
If a field is empty, the default value will be used.

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

You can also post an array of responses, and the endpoint will cycle through them.

```
POST /mock/whatever-name-i-want/response

[
  {
    "status": 417,
    "payload": {
      "error_message": "Sorry Mr. Wayne, I'm just a teapot"
    },
    "headers": {
      "some-kind-of-header": "auie,ctsrnm"
    }
  },
  {
    "status": 200,
    "payload": {
      "confirmation": true
    }
  }
]
```

#### Get stored requests

To get all requests stored for some name:

```
GET /mock/whatever-name-i-want
```

You can filter with the following query parameters:

 * `method`: HTTP method used
 * `since`: requests received after some time (as an epoch timestamp in milliseconds)
 * `until`: requests received before some time (as an epoch timestamp in milliseconds)

The response has the following format:

```json
[
  {
    "query": {
      "some": "parameter"
    },
    "body": {
      "name": "Bruce Wayne",
      "affiliation": "Wayne Enterprises",
      "hobby": "Dressing like a bat"
    },
    "headers": {
      "content-type": "application/json",
      "accept": "*/*",
      "accept-encoding": "gzip, deflate",
      "content-length": "19",
    },
    "server_date": "2018-10-23T09:56:13.888Z",
    "webhook_name": "whatever-name-i-want",
    "method": "POST"
  }
]
```

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

#### Retrieve all SMS sent

```
GET /twilio/messages

[
  {
    "To": "+33606060606",
    "From": "+33101010101",
    "Body": "Your verification code is 123456"
  }
]
```

You can filter with the following query parameters:

 * `from`: filter sender
 * `to`: filter recipient
 * `since`: filter date
 * `until`: filter date

### User Event Webhooks

#### Sent a fake user event to hook

```
POST /webhooks

{
  user_id: "AWUP1Ossnw9pvRbP9-aZ",
  event: {
    type: "login",
    auth_type: "facebook",
    device: "desktop",
    date: "2018-08-06T15:22:16.688Z"
  }
}
```

#### Retrieve all user events hooked

```
GET /webhooks

[
  {
    user_id: "AWUP1Ossnw9pvRbP9-aZ",
    event: {
      type: "login",
      auth_type: "facebook",
      device: "desktop",
      date: "2018-08-06T15:22:16.688Z"
    }
  }
]
```

You can filter with the following parameters:

 * `user_id`: filter user_id
 * `type`: filter event type
 * `since`: filter date
 * `until`: filter date
