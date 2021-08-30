const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
var readline = require("readline")

const packageDefinition = protoLoader.loadSync('chat.proto', {})
const grpcObject = grpc.loadPackageDefinition(packageDefinition)

const chatPackage = grpcObject.chatPackage
const REMOTE_SERVER = "0.0.0.0:3000";

const client = new chatPackage.Chat(REMOTE_SERVER, grpc.credentials.createInsecure())


//Read terminal Lines
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Ask user name then start the chat
rl.question("What's your name? ", answer => {
    username = answer;

    startChat();
});

//Start the stream between server and client
function startChat() {
    const metadata = new grpc.Metadata()
    metadata.add('user', username)

    const channel = client.join(metadata)

    
    rl.on("line", text => {
        client.send({ user: username, text: text }, res => { });
    });
    
    channel.on("data", onData)
    channel.on('end', e => console.log('server done'))


}

//When server send a message
function onData(message) {
    if (message.text === "quit"){
        client.send({user: username, text: 'quit'}, res => {})
    }
    if (message.user == username) {
        return;
    }
    console.log(`${message.user}: ${message.text}`);
}
