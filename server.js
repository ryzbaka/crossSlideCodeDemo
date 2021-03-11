const PORT = 2300;

const express = require('express');
const app = express();
const http = require('http')
const bodyParser = require('body-parser');
const path = require("path");

app.use(bodyParser.json());
app.use(express.static(__dirname+"/public/"));
const server = http.createServer(app);
const io = require('socket.io')(server);

io.sockets.on('connection',(socket)=>{
	console.log(`connected to client socket insance: ${socket.id}`);
	socket.on("create-room",()=>{
		const roomName = socket.id;
		socket.join(roomName);
		io.to(roomName).emit('created-room');
		console.log(socket.rooms)
	})
	socket.on("join-room",({roomName,name})=>{
		console.log(`Received request from ${socket.id}/${name} to join ${roomName}`);
		socket.join(roomName)
		io.to(roomName).emit("joined-room",{name:name,roomName:roomName});
	});
	socket.on("new-pan",({data,roomName,userName})=>{
		// console.log(data)
		io.to(roomName).emit("sync-pan",{data:data,userName:userName,roomName:roomName})
	})
})

app.get("/",(req,res)=>{
	res.sendFile(path.join(__dirname,"index.html"));
})

server.listen(PORT, ()=>console.log(`Server listening on port: ${PORT}`));



