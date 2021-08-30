const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')

const packageDefinition = protoLoader.loadSync(__dirname + '/chat.proto', {})
const grpcObject = grpc.loadPackageDefinition(packageDefinition)
const chatPackage = grpcObject.Package
const REMOTE_SERVER = '0.0.0.0:3000'
const server = new grpc.Server()

server.bind(REMOTE_SERVER, grpc.ServerCredentials.createInsecure())
const users = []

server.addService(chatPackage.Chat.service,{
    'chat': (call) => {
        users.push(call)
        users.forEach(u => {
            u.write({user: u.metadata.get('user'), text: 'user joined'})
        })

        call.on('data', message => {
            users.forEach(u => u.write(message))
        })

    }
})
server.start()