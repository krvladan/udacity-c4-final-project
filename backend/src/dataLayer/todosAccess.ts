import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as AWS from 'aws-sdk'

import { TodoItem } from "../models/TodoItem";
import { Logger } from "winston";
import { createLogger } from "../utils/logger"

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly createdAtIndex = process.env.CREATED_AT_INDEX,
    private readonly logger : Logger = createLogger('TodosAccess')
  ) {}

  async getTodos(userId: string) : Promise<TodoItem[]> {
    this.logger.info('Getting all todos')
  
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.createdAtIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()
  
    this.logger.info('Query result', result);
    
    const items = result.Items
    return items as TodoItem[]
  }

}