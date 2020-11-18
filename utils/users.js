const users = [];

const rooms = new Map();

function getNumberInRoom(room){
  return rooms.get(room);
}

// Join user to chat
function userJoin(id, username, room) {
  const user = { id, username, room };

  users.push(user);

  if(! rooms.has(room)){
    rooms.set(room, 1);
  }else{
    rooms.set(room, rooms.get(room) + 1);
  }

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    const room = getCurrentUser(id).room;

    if(rooms.get(room) === 1){
      rooms.delete(room);
    }else{
      rooms.set(room, rooms.get(room) - 1);  
    }

    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getNumberInRoom
};