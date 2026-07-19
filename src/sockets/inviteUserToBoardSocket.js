export const inviteUserToBoardSocket = (socket) => {
  // listen event from client
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    // basic to do: emit a event to all other clients except the sender
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}