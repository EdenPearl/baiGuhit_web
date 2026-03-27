// src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "https://ebaybaymo-server-b084d082cda7.herokuapp.com"; // Replace with your server URL

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;
