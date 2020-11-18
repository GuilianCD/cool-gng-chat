const socket = io();

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
  });

// Join chatroom
socket.emit('joinRoom', { username, room });


const chatForm = document.getElementById("chatform");
const chat = document.getElementById("chat");
const numOfPeople = document.getElementById("numPeopleInRoom");


document.getElementById("room-name").innerHTML = room;


socket.on("message", message => {
    addMessage(message);

    chat.scrollTop = chat.scrollHeight;
});

socket.on("infomessage", numPeople => {
    numOfPeople.innerHTML = numPeople;
});

chatForm.addEventListener("submit", e => {
    e.preventDefault();

    let msg = e.target.elements.message.value; 

    msg = msg.trim();
  
    if (!msg){
        return false;
    }

    // Emit message to server
    socket.emit('chatMessage', msg);

    // Clear input
    e.target.elements.message.value = '';
    e.target.elements.message.focus();
});


function addMessage(msg) {
    const div = document.createElement('div');
    div.classList.add("chatmessage");

    /////////////////////////////////
    //Create the info box
    const userbox = document.createElement('div');
    userbox.classList.add("userbox");
    div.appendChild(userbox);

    const userboxName = document.createElement('p'); 
    userboxName.classList.add("messagesender");   
    userboxName.innerHTML = msg.username;
    userbox.appendChild(userboxName);

    const userboxDate = document.createElement('p'); 
    userboxDate.classList.add("messagedate");   
    userboxDate.innerHTML = msg.time;
    userbox.appendChild(userboxDate);

    /////////////////////////////////
    //Create the content box
    const msgbox = document.createElement('div');
    msgbox.classList.add("messagecontent");
    div.appendChild(msgbox);

    const messageP = document.createElement('p'); 
    messageP.innerHTML = msg.text;
    msgbox.appendChild(messageP);

    ///////////////////
    //Append the new message to the chat
    chat.appendChild(div);
}