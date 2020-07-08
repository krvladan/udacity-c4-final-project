import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as AWS from 'aws-sdk'

import { TodoItem } from "../models/TodoItem";
import { Logger } from "winston";
import { createLogger } from "../utils/logger"
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";

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

async createTodo(todoItem: TodoItem): Promise<TodoItem> {
  this.logger.info('Put item', todoItem)

  await this.docClient.put({
    TableName: this.todosTable,
    Item: todoItem
  }).promise()

  return todoItem
}

async updateTodo(userId: string, itemId: string, updateRequest: UpdateTodoRequest) {
  this.logger.info('Update item', {userId, itemId, updateRequest})
  
  const result = await this.docClient.update({
    TableName: this.todosTable,
    Key: {
      "userId": userId,
      "todoId": itemId
    },
    UpdateExpression: "SET #nm=:n, dueDate=:dd, done=:dn",
    ExpressionAttributeValues: {
      ":n": updateRequest.name,
      ":dd": updateRequest.dueDate,
      ":dn": updateRequest.done
    },
    ExpressionAttributeNames: {
      "#nm": "name"
    },
    ReturnValues:"UPDATED_NEW"
  }).promise()

  this.logger.info("Update result", result)
}

async deleteTodo(userId: string, todoId: string) {
  this.logger.info('Delete item', {userId, todoId})

  await this.docClient.delete({
    TableName: this.todosTable,
    Key: {
      userId,
      todoId
    }
  }).promise()

}

}