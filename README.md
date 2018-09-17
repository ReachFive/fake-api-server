# Fake API Server


## Install dependencies
npm install

## Start development live-reload server
PORT=1090 npm run dev

## Start production server:
PORT=1090 npm start

## Endpoints

### Twilio

#### Send a fake SMS

```
POST /twilio/messages

{
  To: "+33606060606",
  From: "+33101010101",
  Body: "Your verification code is 123456"
}
```

#### Retrieve all SMS sent

```
GET /twilio/messages

[
  {
    To: "+33606060606",
    From: "+33101010101",
    Body: "Your verification code is 123456"
  }
]
```

You can filter with the following parameters:

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
