const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cookieParser = require('cookie-parser');

const formatMessage = require("./utils/messages");
const { 
    userJoin, 
    userLeave, 
    getCurrentUser, 
    getNumberInRoom
} = require("./utils/users");
const {
    openDB,
    verifyPassword,
    registerUser,
    closeDB
} = require("./utils/database");


const PORT = process.env.PORT || 8080;
const botname = "Jeff Botzos";

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Sets the static folder to the "public" folder
app.use('/static', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());
// Parse JSON bodies (as sent by API clients)
app.use(express.json());


//Database open
openDB();


//Run when a client connects
io.on("connection", socket => {
    socket.on("joinRoom", ({username, room}) => {
        //Actually join the room
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        //On join
        //Send a welcome message to the newly connected
        socket.emit("message", formatMessage(botname, "Welcome to the chat ! (Yes I am the real Jeff Bezos, stop asking)"));
        io.to(user.room).emit("infomessage", getNumberInRoom(user.room));

        socket.broadcast.to(user.room).emit("message", formatMessage(botname, `${user.username} has joined the room.`));
    });

    socket.on("chatMessage", (message) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit("message", formatMessage(user.username, message));


        //Funny bit
        if(message.toLowerCase().includes("is that jeff bezos ?")){
            io.to(user.room).emit("message", formatMessage(botname, `Yes, it is me, definitely not a robot, please stop asking.`));
        }
    });

    //Upon disconnection
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit("infomessage", getNumberInRoom(user.room));
            io.to(user.room).emit("message", formatMessage(botname, `${user.username} has disconnected from the room.`));
        }
    });
});








app.get('/', (request, response) => {
    response.render('pages/home');
});


/*
app.get('/chat', (request, response) => {
    if(request.query.username === undefined){
        response.render('pages/chatlogin');
    }else{
        //Client is logged
        response.render('pages/chat');
    }
});
*/

app.post('/login', function(request, response){
    console.log(request.body.user.name);
    console.log(request.body.user.password);
});

app.use((request, response) => {
    response.render('pages/notFound');
});

server.listen(PORT, () => { console.log(`Server running on port ${PORT}`)});