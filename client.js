const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync('todo.proto', {})

const grpcObject = grpc.loadPackageDefinition(packageDefinition)

const todoPackage = grpcObject.todoPackage

const client = new todoPackage.Todo('localhost:3000', grpc.credentials.createInsecure())
const action = process.argv[2] || 'readTodos'


switch (action) {
    case 'createTodo':
        const description = process.argv[3] || undefined
        if (!description) throw (new Error('Description is mandatory'))
        client.createTodo({
            description
        }, (error, response) => {
            if (error) throw error
        })
        break
    case 'readTodos':
        client.readTodos({}, (error, response) => {
            if (error) throw error
            if (response.items){
                response.items.forEach(todo => {
                    console.table(todo)
                });
                console.table()
            }

        })
        break

}
