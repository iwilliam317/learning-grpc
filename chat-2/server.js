const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')

const packageDefinition = protoLoader.loadSync(__dirname + '/chat.proto', {})
const grpcObject = grpc.loadPackageDefinition(packageDefinition)
const chatPackage = grpcObject.Package
const REMOTE_SERVER = '0.0.0.0:3000'
const server = new grpc.Server()

server.bind(REMOTE_SERVER, grpc.ServerCredentials.createInsecure())
const clients = new Map()

const notifyClients = (user, message, users = clients) => {
    for (let [client, call] of users) {
        if (client != user) {
            call.write(message)
        }
    }
}

server.addService(chatPackage.Chat.service, {
    'chat': (call) => {
        const user = call.metadata.get('user')

        if (!clients.get(user)) {
            clients.set(user, call)
        }
        notifyClients(user, { user, text: "joined the chat..." })


        call.on('data', message => {
            notifyClients(user, message)
        })

        call.on('end', () => {
            call.write({user, text: 'leaving chat...'})
            notifyClients(user, {user, text: 'left the chat...'})
            call.end()
        })

    }
})


server.start()