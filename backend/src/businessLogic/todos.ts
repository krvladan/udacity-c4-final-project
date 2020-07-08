import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todosAccess = new TodosAccess()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  return todosAccess.getTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  const itemId = uuid.v4()

  const newItem: TodoItem = {
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString()
  }

  return todosAccess.createTodo(newItem)
}

export async function updateTodo(userId: string, itemId: string, updateRequest: UpdateTodoRequest) {
  await todosAccess.updateTodo(userId, itemId, updateRequest)
}

export async function deleteTodo(userId: string, itemId: string) {
  await todosAccess.deleteTodo(userId, itemId)
}