const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync('todo.proto', {})
const grpcObject = grpc.loadPackageDefinition(packageDefinition)
const todoPackage = grpcObject.todoPackage

const server = new grpc.Server()
server.bind('0.0.0.0:3000', grpc.ServerCredentials.createInsecure())

const todos = []
let id = 0

const createTodo = (call, callback) => {
    const {description} = call.request
    if (!description) return callback(new Error('Description is mandatory!'))

    const todo = {id, description, done: false}
    todos.push(todo)
    id++
    callback(null, todo)

}

const readTodos = (call, callback) => {
    callback(null, {items: todos})
}

const readTodosStream = (call, callback) => {
    todos.forEach(todo => call.write(todo))
    call.end()
}

server.addService(todoPackage.Todo.service, {
    "createTodo": createTodo,
    "readTodos": readTodos,
    "readTodosStream": readTodosStream
})

server.start()