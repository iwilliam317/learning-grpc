const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
var readline = require("readline")

const packageDefinition = protoLoader.loadSync(__dirname + '/chat.proto', {})
const grpcObject = grpc.loadPackageDefinition(packageDefinition)

const chatPackage = grpcObject.Package
const REMOTE_SERVER = "0.0.0.0:3000";

const client = new chatPackage.Chat(REMOTE_SERVER, grpc.credentials.createInsecure())
const meta = new grpc.Metadata()
const user = process.argv[2] || 'unknown'

meta.add('user', user)
const call = client.chat(meta)


call.on('data', message => {
  console.log(`${message.user}: ${message.text}`)
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on("line", function (line) {
  if (line === "quit") {
    console.log('here')
    call.end()
    rl.close()
  } else {

    call.write({ user, text: line})
  }
})
