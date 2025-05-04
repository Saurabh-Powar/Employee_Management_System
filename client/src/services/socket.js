// Example of how to implement Socket.io on your client side
// Add this to a new file like client/src/services/socket.js

import { io } from "socket.io-client"

const socket = io("https://employee-management-system-gv8r.onrender.com", {
  withCredentials: true,
  autoConnect: false,
})

export const connectSocket = (userId) => {
  if (userId) {
    socket.auth = { userId }
    socket.connect()
  }
}

export const disconnectSocket = () => {
  socket.disconnect()
}

export const subscribeToNotifications = (callback) => {
  socket.on("notification", callback)
  return () => socket.off("notification", callback)
}

export default socket
