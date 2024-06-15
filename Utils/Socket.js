const sockerIo = require('socket.io')

let io
let connectedUsers = {}

module.exports = {
    init:(server)=>{
        io = sockerIo(server,{
            cors : {
                origin : 'http://localhost:5173',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
                allowedHeaders: ['Content-Type','Origin', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Authorization','Access-Control-Allow-Origin'],
                credentials: true
            }
        })

        io.on('connection', (socket) => {
            console.log("User connected");
      
            socket.on('userConnected', (userId) => {
              connectedUsers[userId] = socket.id;
              console.log(connectedUsers);
            });
      
            socket.on('disconnect', () => {
              for (let userId in connectedUsers) {
                if (connectedUsers[userId] === socket.id) {
                  delete connectedUsers[userId];
                  break;
                }
              }
              console.log('A user disconnected');
            });
          });
      
          return io;
    },
    getIo:()=>{
        if(!io){
            throw new Error("Io not initialied")
        }
        return io
    },
    getConnectedUser:()=>{
         return connectedUsers
    }
}