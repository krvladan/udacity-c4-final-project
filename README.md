# Serverless TODO

This is a simple serverless application with a backend and a frontend part. The backend part is given as a skeleton to be fleshed out as an exercise in the fourth course of Udacity's Cloud Developer Nanodegree program.

# Functionality of the application

This application will allow creating/removing/updating/fetching TODO items. Each TODO item can optionally have an attachment image. Each user only has access to TODO items that he/she has created.

# Setup

## Backend

Backend can be deployed to AWS. Before deploying it, `backend/serverless.yml` file needs to be edited:

- Set the desired region to which the app is to be deployed (currently it is set to 'eu-central-1')
- Edit `ATTACHMENTS_S3_BUCKET` environment variable to a globally unique name that can be used when S3 is created.

## Frontend

The `client` directory contains a web application that can use the API that is developed in the project.

Before using it you need to edit is the `config.ts` file in the `client` directory. This file configures the client application to connect to the appropriate backend deployment:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

## Authentication

For authentication to work, you can create a free account at `https://auth0.com/`. There you will need to create an application. Select a single page application and assymetric verification type. Then paste JSON Web Key Set url to `./backend/src/lambda/auth/auth0Authorizer.ts`.
Also, set the `clientId` variable in frontend's `config.ts`.

# How to run the application

## Backend

To install dependencies and deploy the backend, run the following commands:

```
cd backend
npm install
sls deploy -v
```

This assumes that you have `~/.aws/credentials` set up.

If you get an `JavaScript heap out of memory` error, increase the memory by executing `export NODE_OPTIONS="--max-old-space-size=4096"` before trying to deploy again.

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless TODO application.
