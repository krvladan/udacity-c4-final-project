import Axios from 'axios'

import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'
import { Jwt } from '../../auth/Jwt'

const logger = createLogger('auth')

const jwksUrl = 'https://krvladan.eu.auth0.com/.well-known/jwks.json'

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
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  const jwks = (await Axios.get(jwksUrl)).data
  const signingKeys = jwks.keys.filter(
    key => 
      key.use === 'sig' &&                              // JWK property `use` determines the JWK is for signing
      key.kty === 'RSA' &&                              // We are only supporting RSA (RS256)
      key.kid &&                                        // The `kid` must be present to be useful for later
      ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
    ).map(key => {
      return {kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0])}
    })

  if(signingKeys.length === 0) { throw new Error('No signingKeys') }

  const { kid, alg } = jwt.header

  if (alg !== "RS256") { throw new Error('Wrong algorithm') }

  const signingKey = signingKeys.find(key => key.kid === kid)
  if(!signingKey) { throw new Error('No signingKey') }

  const certificate = signingKey.publicKey

  return verify(token, certificate, { algorithms: ['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

export function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}