const express = require("express");
const {
Server
} = require("socket.io");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(express.json());

const io = new Server();



app.get("/", (req, res) => {
    res.send("Hello World!");
});

const emailtoSocketMapping = new Map();
const socketIdtoEmailMapping = new Map();

io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("join-room" , (data) => {
        console.log("User joined room", data);
        const {roomId , emailId} = data;
        emailtoSocketMapping.set(emailId, socket.id);
        socketIdtoEmailMapping.set(socket.id, emailId);
        socket.join(roomId);
        socket.emit("joined-room", {
            roomId,
            emailId
        });
        console.log(`User joined room: ${roomId}`);
        socket.broadcast.to(roomId).emit("user-joined", {
            emailId
        });

        socket.on("call-user", (data) => {
            const {emailId , offer} = data;
            const socketid = emailtoSocketMapping.get(emailId);
            const fromEmailId = socketIdtoEmailMapping.get(socket.id);
            socket.to(socketid).emit("incoming-call", {
                from : fromEmailId,
                offer
            });
        });


        socket.on("call-accepted", (data) => {
            const {emailId , ans} = data;
            const socketid = emailtoSocketMapping.get(emailId);
            socket.to(socketid).emit("call-accepted", {
                ans
            });
        });
    });
});


app.listen(8000, () => {
    console.log("Server is running on port 8000");
});

io.listen(8001, () => {
    console.log("Socket.IO server is running on port 8001");
});