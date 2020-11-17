const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const formatMessage = require("./utils/messages");
const { 
    userJoin, 
    userLeave, 
    getCurrentUser, 
    getRoomUsers 
} = require("./utils/users");


const PORT = process.env.PORT || 8080;
const botname = "Jeff Botzos";

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Sets the static folder to the "public" folder
app.use('/static', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');


//Run when a client connects
io.on("connection", socket => {
    socket.on("joinRoom", ({username, room}) => {
        //Actually join the room
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        //On join
        //Send a welcome message to the newly connected
        socket.emit("message", formatMessage(botname, "Welcome to the chat ! (Yes I am the real Jeff Bezos, stop asking)"));

        socket.broadcast.to(user.room).emit("message", formatMessage(botname, `${user.username} has joined the room.`));
    });

    socket.on("chatMessage", (message) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit("message", formatMessage(user.username, message));



        if(message.toLowerCase().includes("is that jeff bezos ?")){
            io.to(user.room).emit("message", formatMessage(botname, `Yes, it is me, definitely not a robot, please stop asking.`));
        }
    });

    //Upon disconnection
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit("message", formatMessage(botname, `${user.username} has disconnected from the room.`));
        }
    });
});





app.get('/', (request, response) => {
    response.render('pages/home');
});

app.get('/chat', (request, response) => {
    if(request.query.username === undefined){
        response.render('pages/chatlogin');
    }else{
        //Client is logged
        response.render('pages/chat');
    }
});

app.use((request, response) => {
    response.render('pages/notFound');
});

server.listen(PORT, () => { console.log(`Server running on port ${PORT}`)});