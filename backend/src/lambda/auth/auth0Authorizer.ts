import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
// import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const certificate = `-----BEGIN CERTIFICATE-----
MIIDBTCCAe2gAwIBAgIJekR2uIYUGmKLMA0GCSqGSIb3DQEBCwUAMCAxHjAcBgNV
BAMTFWtydmxhZGFuLmV1LmF1dGgwLmNvbTAeFw0yMDA3MDExOTIzMTFaFw0zNDAz
MTAxOTIzMTFaMCAxHjAcBgNVBAMTFWtydmxhZGFuLmV1LmF1dGgwLmNvbTCCASIw
DQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMGC1IQ2rORIj71HOOvumLAdz6qa
eW0ypTiAVUxh4GOt1NmeQzAc3UBw/VfgX1iq5dl2zkkkPRKXKgqMt2UugARjRFTl
ZxtXls2+bB7xf4s/o1I4xIkWZAnVE4NzRsho4+Ca+dpNzqW8b+naoN/sHCTFN/u6
C7BfgA/sJZ5SUG2da0IiceUSV4+AYPi3pjFYXd7uxGH1Ka1heMgp7A32rO5Jdxwm
XgeYfq3lBCw3mlEm6wf5bmm+A4IbkhktkZWnI/DJKjcZoOwgmRFObVxUWrsctvt4
wqdnqGy6Gk9Bpldge+aFXT9ZmrMLhJD2qxkMH+s4zbZzDzn/ymwxRcxYxzcCAwEA
AaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUkg4AIdbLSvWyaE69iZ1S
8EfwUTAwDgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQCJm4u765kN
kGGvK1yx2RI1Qxg/q3id4zsKBFULtNKthNGdJroHvdqrxZkfUzZrkatTwMYey87S
DOtpIT6CkTdMx2Z5aHkpMPcJzIQqUoa+E5RdoD29hC6yegDZX3OFn2I0gEWGNMs9
yYSwj4SVQVQN0Uia+iDW40uz/RNuMz2HGdt0pC6r0OlGNJ67D/0sDV58D0ouueAv
+O+x90xYg4DQAUTQqa0ycA8Um0rBLJC+8sO/LVLwwlHRJcX9aE3kAu/yMb9C34fB
L5i6Bxcy7NPOREHzmpwCS1hqIuLMmmvPb6Fhhfg5BtWj4a2GjlxojS0ZUgDcbVSG
XkFJBEB3zcXp
-----END CERTIFICATE-----`


export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  
  return verify(token, certificate, { algorithms: ['RS256']}) as JwtPayload
  

  // return undefined
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

