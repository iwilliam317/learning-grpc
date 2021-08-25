const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync(__dirname + '/chat.proto', {})
const grpcObject = grpc.loadPackageDefinition(packageDefinition)
const chatPackage = grpcObject.chatPackage

const server = new grpc.Server()
server.bind('0.0.0.0:3000', grpc.ServerCredentials.createInsecure())

let users = []

function join(call) {
    users.push(call);
    notifyChat({ user: call.metadata.get('user'), text: "joined the chat..." });
}

function notifyChat(message) {
    users.forEach(user => {
        user.write(message);
    });
}

function send(call, callback) {
    notifyChat(call.request);
}
server.addService(chatPackage.Chat.service, {
    "join": join,
    "send": send
})

server.start()