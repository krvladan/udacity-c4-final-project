import * as AWS from 'aws-sdk'
import * as AWSXray from 'aws-xray-sdk'

import { DocumentClient } from "aws-sdk/clients/dynamodb"

import { TodoItem } from "../models/TodoItem";
import { Logger } from "winston";
import { createLogger } from "../utils/logger"
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";

const XAWS = AWSXray.captureAWS(AWS)

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly createdAtIndex = process.env.CREATED_AT_INDEX,
    private readonly logger : Logger = createLogger('TodosAccess')
  ) {}

  async getTodos(userId: string) : Promise<TodoItem[]> {
    this.logger.info('getTodos', {userId})
  
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.createdAtIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()
  
    this.logger.info('getTodos query result', result);
    
    const items = result.Items
    return items as TodoItem[]
  }

async createTodo(todoItem: TodoItem): Promise<TodoItem> {
  this.logger.info('createTodo', todoItem)

  await this.docClient.put({
    TableName: this.todosTable,
    Item: todoItem
  }).promise()

  return todoItem
}

async updateTodo(userId: string, itemId: string, updateRequest: UpdateTodoRequest) {
  this.logger.info('updateTodo', {userId, itemId, updateRequest})
  
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

  this.logger.info("updateTodo query result", result)
}

async deleteTodo(userId: string, todoId: string): Promise<TodoItem> {
  this.logger.info('deleteTodo', {userId, todoId})

  const result = await this.docClient.delete({
    TableName: this.todosTable,
    Key: {
      userId,
      todoId
    },
    ReturnValues: 'ALL_OLD'
  }).promise()

  const todoItem = result.Attributes as TodoItem

  this.logger.info('deleteTodo result', {todoItem})

  return todoItem
}

async addAttachmentUrl(userId: string, todoId: string, url: string) {
  this.logger.info('addAttachmentUrl', {userId, todoId, url})

  const result = await this.docClient.update({
    TableName: this.todosTable,
    Key: {
      "userId": userId,
      "todoId": todoId
    },
    UpdateExpression: "SET attachmentUrl=:x",
    ExpressionAttributeValues: {
      ":x": url
    },
    ReturnValues:"UPDATED_NEW"
  }).promise()

  this.logger.info("addAttachmentUrl result", result)
}

}
