import * as AWS from 'aws-sdk'
import * as AWSXray from 'aws-xray-sdk'

import { DocumentClient } from "aws-sdk/clients/dynamodb"

import { TodoItem } from "../models/TodoItem";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";

const XAWS = AWSXray.captureAWS(AWS)

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly createdAtIndex = process.env.CREATED_AT_INDEX
  ) {}

  async getTodos(userId: string) : Promise<TodoItem[]> {
    console.log('getTodos', {userId})
  
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.createdAtIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()
  
    console.log('getTodos query result', result);
    
    const items = result.Items
    return items as TodoItem[]
  }

async createTodo(todoItem: TodoItem): Promise<TodoItem> {
  console.log('createTodo', todoItem)

  await this.docClient.put({
    TableName: this.todosTable,
    Item: todoItem
  }).promise()

  return todoItem
}

async updateTodo(userId: string, itemId: string, updateRequest: UpdateTodoRequest) {
  console.log('updateTodo', {userId, itemId, updateRequest})
  
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

  console.log("updateTodo query result", result)
}

async deleteTodo(userId: string, todoId: string): Promise<TodoItem> {
  console.log('deleteTodo', {userId, todoId})

  const result = await this.docClient.delete({
    TableName: this.todosTable,
    Key: {
      userId,
      todoId
    },
    ReturnValues: 'ALL_OLD'
  }).promise()

  const todoItem = result.Attributes as TodoItem

  console.log('deleteTodo result', {todoItem})

  return todoItem
}

async addAttachmentUrl(userId: string, todoId: string, url: string) {
  console.log('addAttachmentUrl', {userId, todoId, url})

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

  console.log("addAttachmentUrl result", result)
}

}
