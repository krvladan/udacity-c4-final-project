import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { TodoItem } from '../../models/TodoItem'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event', JSON.stringify(event))

  // TODO: Get all TODO items for a current user

  const todoItems: Array<TodoItem> = [
      {
        userId: "1",
        todoId: "123",
        createdAt: "2019-07-27T20:01:45.424Z",
        name: "Buy milk",
        dueDate: "2019-07-29T20:01:45.424Z",
        done: false,
        attachmentUrl: "http://example.com/image.png"
      },
      {
        userId: "1",
        todoId: "456",
        createdAt: "2019-07-27T20:01:45.424Z",
        name: "Send a letter",
        dueDate: "2019-07-29T20:01:45.424Z",
        done: true,
        attachmentUrl: "http://example.com/image.png"
      },
    ]

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
