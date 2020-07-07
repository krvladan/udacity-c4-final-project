import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { TodoItem } from '../../models/TodoItem'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const docClient: DocumentClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

const logger = createLogger('getTodos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event', event)

  const userId = getUserId(event)

  const todoItems = await getTodos(userId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: todoItems
    })
  }
}

async function getTodos(userId: string) : Promise<TodoItem[]> {
  logger.info('Getting all todos')

  const result = await docClient.query({
    TableName: todosTable,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ScanIndexForward: false
  }).promise()

  logger.info('Query result', result);
  
  const items = result.Items
  return items as TodoItem[]
}